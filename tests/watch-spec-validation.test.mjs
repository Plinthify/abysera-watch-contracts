import test from 'node:test';
import assert from 'node:assert/strict';
import { WatchSpecSchema } from '../src/index.ts';

test('rejects price watch sources without a symbol', () => {
  const result = WatchSpecSchema.safeParse({
    agentId: 'agent-1',
    priority: 'medium',
    source: { type: 'price', field: 'last' },
    condition: { op: 'gt', value: 10 },
    trigger: { cooldown: '1m' },
    resumeContext: {},
  });

  assert.equal(result.success, false);
});

test('rejects whitespace-only symbols for price sources', () => {
  const result = WatchSpecSchema.safeParse({
    agentId: 'agent-1',
    priority: 'medium',
    source: { type: 'price', symbol: '   ', field: 'last' },
    condition: { op: 'gt', value: 10 },
    trigger: { cooldown: '1m' },
    resumeContext: {},
  });

  assert.equal(result.success, false);
});
