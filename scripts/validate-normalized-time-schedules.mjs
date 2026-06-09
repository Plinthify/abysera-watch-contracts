import { normalizeWatchSpec, TimeSourceSchema, WatchSpecSchema } from '../dist/index.js';

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

const legacyTimeSource = TimeSourceSchema.parse({
  type: 'time',
  schedule: '5 * * * *',
});
assert(typeof legacyTimeSource.schedule === 'string', 'legacy cron schedule should remain accepted as string input');

const canonicalEvery = TimeSourceSchema.parse({
  type: 'time',
  schedule: {
    kind: 'every',
    interval: '15m',
  },
});
assert(canonicalEvery.schedule.kind === 'every', 'canonical every schedule should parse');

const canonicalAtOffsetSchedule = TimeSourceSchema.parse({
  type: 'time',
  schedule: {
    kind: 'at',
    at: '2026-04-20T13:30:00+01:00',
  },
});
assert(canonicalAtOffsetSchedule.schedule.kind === 'at', 'canonical at schedule with offset should parse');

const canonicalAt = TimeSourceSchema.parse({
  type: 'time',
  schedule: {
    kind: 'at',
    at: '2026-04-20T12:30:00.000Z',
  },
});
assert(canonicalAt.schedule.kind === 'at', 'canonical at schedule should parse');

const normalizedLegacyWatch = normalizeWatchSpec({
  agentId: 'agent-1',
  priority: 'medium',
  source: {
    type: 'time',
    schedule: ' 5 * * * * ',
  },
  condition: { op: 'gt', value: 0 },
  trigger: { cooldown: '5m', fireOnce: true },
  resumeContext: {},
});
assert(normalizedLegacyWatch.source.schedule.kind === 'cron', 'legacy cron schedule should normalize to cron object');
assert(normalizedLegacyWatch.source.schedule.expression === '5 * * * *', 'legacy cron schedule should trim during normalization');
assert(normalizedLegacyWatch.trigger.maxFires === 1, 'fireOnce should normalize to maxFires=1');

const normalizedCanonicalWatch = normalizeWatchSpec({
  agentId: 'agent-1',
  priority: 'high',
  source: {
    type: 'time',
    schedule: {
      kind: 'at',
      at: '2026-04-20T12:30:00Z',
    },
  },
  condition: { op: 'gt', value: 0 },
  trigger: { cooldown: '15m' },
  resumeContext: {},
});
assert(normalizedCanonicalWatch.source.schedule.kind === 'at', 'canonical at schedule should stay canonical after normalization');
assert(normalizedCanonicalWatch.source.schedule.at === '2026-04-20T12:30:00.000Z', 'canonical at schedule should normalize to ISO string');

const parsedWatch = WatchSpecSchema.parse({
  agentId: 'agent-2',
  priority: 'medium',
  source: {
    type: 'time',
    schedule: {
      kind: 'cron',
      expression: '38 * * * *',
    },
  },
  condition: { op: 'gt', value: 1 },
  trigger: { cooldown: '10m' },
  resumeContext: {},
});
assert(parsedWatch.source.schedule.kind === 'cron', 'watch spec should accept canonical cron object schedule');

console.log('normalized time schedule contract checks passed');
