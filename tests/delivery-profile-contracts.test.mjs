import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DeliveryProfileSchema,
  DeliveryProfileValidationChallengeSchema,
} from '../src/index.ts';

test('accepts Hermes webhook delivery profiles', () => {
  const result = DeliveryProfileSchema.safeParse({
    id: 'profile-1',
    agentId: 'trader-1',
    label: 'primary hermes',
    isDefault: true,
    status: 'needs_validation',
    provider: 'hermes_webhook',
    config: {
      url: 'http://127.0.0.1:8651/webhooks/hall-monitor-trader-1',
      secret: 'top-secret',
      timeoutMs: 10000,
    },
  });

  assert.equal(result.success, true);
});

test('accepts OpenClaw delivery profiles', () => {
  const result = DeliveryProfileSchema.safeParse({
    id: 'profile-2',
    agentId: 'trader-1',
    label: 'primary openclaw',
    isDefault: false,
    status: 'validated',
    provider: 'openclaw',
    config: {
      url: 'http://127.0.0.1:18789/hooks/agent',
      token: 'secret-token',
      senderName: 'Abysera',
      wakeMode: 'now',
      deliver: true,
      channel: 'last',
      timeoutMs: 10000,
    },
  });

  assert.equal(result.success, true);
});

test('rejects provider/config mismatches', () => {
  const result = DeliveryProfileSchema.safeParse({
    id: 'profile-3',
    agentId: 'trader-1',
    label: 'bad profile',
    isDefault: false,
    status: 'needs_validation',
    provider: 'hermes_webhook',
    config: {
      url: 'http://127.0.0.1:18789/hooks/agent',
      token: 'secret-token',
    },
  });

  assert.equal(result.success, false);
});

test('accepts delivery validation challenge records', () => {
  const result = DeliveryProfileValidationChallengeSchema.safeParse({
    id: 'challenge-1',
    profileId: 'profile-1',
    agentId: 'trader-1',
    status: 'pending',
    nonce: 'nonce-123',
    requestedAt: '2026-04-21T12:00:00.000Z',
    expiresAt: '2026-04-21T12:10:00.000Z',
    completedAt: null,
    error: null,
    metadata: {
      reason: 'manual_revalidate',
    },
  });

  assert.equal(result.success, true);
});