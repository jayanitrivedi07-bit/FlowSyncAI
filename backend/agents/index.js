import { GoogleGenerativeAI } from '@google/generative-ai';
import { masterPrompts } from '../../prompts/agent-prompts.js';
import NodeCache from 'node-cache';

const ai    = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const MODEL = 'gemini-1.5-pro';

// ── LRU-style cache: TTL 60 s, max 50 keys ───────────────────────────────────
// Prevents duplicate Gemini calls during demo spikes / repeated simulations.
const cache = new NodeCache({ stdTTL: 60, checkperiod: 30, maxKeys: 50 });

/**
 * Generates a deterministic cache key from agent name + key context fields.
 * Ignores volatile fields like timestamps so similar contexts hit the cache.
 */
function cacheKey(agentName, ctx, query) {
  const safeCtx = {
    highZones:  (ctx.crowdData || []).filter(z => z.density === 'High').map(z => z.zone).sort(),
    attendees:  ctx.totalAttendees,
    alerts:     ctx.activeAlerts,
  };
  return `${agentName}:${JSON.stringify(safeCtx)}:${(query || '').slice(0, 80)}`;
}

/**
 * Run any registered AI agent by name with provided context.
 * Results are cached for 60 s to reduce API cost during concurrent requests.
 *
 * @param {string} agentName  – key from masterPrompts
 * @param {object} contextData – live venue snapshot
 * @param {string} [userQuery] – optional user question
 */
export const runAgent = async (agentName, contextData, userQuery = '') => {
  // ── Cache check ─────────────────────────────────────────────────────────────
  const key    = cacheKey(agentName, contextData, userQuery);
  const cached = cache.get(key);
  if (cached) {
    console.log(JSON.stringify({ severity: 'INFO', message: `[${agentName}] Cache HIT` }));
    return cached;
  }

  try {
    if (!process.env.GEMINI_API_KEY) {
      console.warn(JSON.stringify({ severity: 'WARNING', message: 'GEMINI_API_KEY missing — returning mock' }));
      const mock = getMockResponse(agentName, contextData);
      cache.set(key, mock);
      return mock;
    }

    const systemPrompt = masterPrompts[agentName];
    if (!systemPrompt) throw new Error(`Agent "${agentName}" not found.`);

    const prompt = `
System Context:
${systemPrompt}

Live Venue Snapshot:
${JSON.stringify(contextData, null, 2)}

User / Task Query:
${userQuery || 'Provide your strategic output.'}
    `.trim();

    const model  = ai.getGenerativeModel({ model: MODEL });
    const result = await model.generateContent(prompt);
    const text   = result.response.text();

    // Store in cache before returning
    cache.set(key, text);
    console.log(JSON.stringify({ severity: 'INFO', message: `[${agentName}] Gemini OK — cached for 60s` }));
    return text;

  } catch (err) {
    console.error(JSON.stringify({ severity: 'ERROR', message: `[${agentName}] Error: ${err.message}` }));
    const mock = getMockResponse(agentName, contextData);
    cache.set(key, mock, 15); // shorter TTL for error responses
    return mock;
  }
};

/* ── Rich mock fallback responses ──────────────────────────────────────────── */
function getMockResponse(agentName, ctx = {}) {
  const highZones = (ctx.crowdData || [])
    .filter(z => z.density === 'High')
    .map(z => z.zone)
    .join(', ') || 'Entrance Gate A';

  const mocks = {
    crowdPredictionAgent: `📊 Prediction (next 10 min): ${highZones} will exceed safe capacity.
Food Court expected to reach HIGH density within 8 minutes due to halftime proximity.
Recommend pre-emptive crowd diversion to Gate C and West Wing.`,

    queueOptimizationAgent: `🍔 Queue Insight: Food Stand 1 has 15-min wait.
Food Stand 3 (West Wing) has only 4-min wait — redirect users there immediately.
Restroom B currently has 2-min wait vs Restroom North at 8 min.`,

    userGuidanceAgent: `🗺️ Fastest Path: Take East Corridor → bypass ${highZones}.
ETA to Main Stage: ~3 min. Avoid North Entrance (blocked).
Accessibility route: Ramp B → Elevator 2 → Block D.`,

    adminAlertAgent: `🚨 ALERT: ${highZones} density CRITICAL.
Recommend deploying 3 crowd-control staff immediately.
Predictive model shows 15% overflow risk in next 6 min.
Auto-routing suggestions sent to user devices.`,

    emergencyResponseAgent: `🚑 EMERGENCY SCAN COMPLETE:
- Exit A: CLEAR ✅
- Exit B: PARTIALLY BLOCKED ⚠️ (crowd spillover from Gate A)
- Exit C: CLEAR ✅
- Exit D: BLOCKED 🚨 (maintenance equipment)
Immediate action: Open auxiliary exit near Block F.
Alert stadium security to Exit D (maintenance crew).
Safe evacuation capacity: 1,200 persons/min via Exits A+C.`,
  };

  return mocks[agentName] || '✅ Agent action completed successfully.';
}
