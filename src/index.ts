import { z } from 'zod';

export const JsonRecordSchema = z.record(z.unknown());

const DURATION_UNIT_ALIASES = {
  ms: 'ms',
  msec: 'ms',
  msecs: 'ms',
  millisecond: 'ms',
  milliseconds: 'ms',
  s: 's',
  sec: 's',
  secs: 's',
  second: 's',
  seconds: 's',
  m: 'm',
  min: 'm',
  mins: 'm',
  minute: 'm',
  minutes: 'm',
  h: 'h',
  hr: 'h',
  hrs: 'h',
  hour: 'h',
  hours: 'h',
  d: 'd',
  day: 'd',
  days: 'd',
  w: 'w',
  wk: 'w',
  wks: 'w',
  week: 'w',
  weeks: 'w',
} as const;

type DurationUnit = keyof typeof DURATION_UNIT_ALIASES;

function normalizeDurationString(value: string): string | null {
  const match = value.trim().match(/^(\d+(?:\.\d+)?)\s*([a-z]+)$/i);
  if (!match) {
    return null;
  }

  const unit = DURATION_UNIT_ALIASES[match[2].toLowerCase() as keyof typeof DURATION_UNIT_ALIASES];
  if (!unit) {
    return null;
  }

  return `${match[1]}${unit}`;
}

type PriceSourceInput = {
  type: 'price';
  symbol: string;
  field: 'last' | 'bid' | 'ask' | 'vwap' | 'open' | 'high' | 'low' | 'close';
  [key: string]: unknown;
};

type IndicatorSourceInput = {
  type: 'indicator';
  symbol: string;
  timeframe?: string;
  indicator: string;
  params: Record<string, number>;
  [key: string]: unknown;
};

type SpreadSourceInput = {
  type: 'spread';
  symbolA: string;
  symbolB: string;
  calc: 'ratio' | 'diff' | 'pct';
  [key: string]: unknown;
};

type VolumeSourceInput = {
  type: 'volume';
  symbol: string;
  window: string;
  [key: string]: unknown;
};

type OrderbookSourceInput = {
  type: 'orderbook';
  symbol: string;
  field: 'depth_imbalance' | 'spread_pct' | 'bid_wall' | 'ask_wall';
  [key: string]: unknown;
};

type VolatilitySourceInput = {
  type: 'volatility';
  symbol: string;
  window: string;
  calc: 'realized' | 'atr' | 'iv';
  [key: string]: unknown;
};

type CorrelationSourceInput = {
  type: 'correlation';
  symbolA: string;
  symbolB: string;
  window: string;
  [key: string]: unknown;
};

type PortfolioSourceInput = {
  type: 'portfolio';
  field: 'total_pnl' | 'position_pnl' | 'drawdown' | 'exposure' | 'unrealized_pnl';
  symbol?: string;
  [key: string]: unknown;
};

type NewsSourceInput = {
  type: 'news';
  keywords: string[];
  sources?: string[];
  [key: string]: unknown;
};

type SentimentSourceInput = {
  type: 'sentiment';
  subject: string;
  sources?: string[];
  window?: string;
  evalFrequency: string;
  [key: string]: unknown;
};

type CronTimeScheduleInput = {
  kind: 'cron';
  expression: string;
};

type EveryTimeScheduleInput = {
  kind: 'every';
  interval: string;
};

type AtTimeScheduleInput = {
  kind: 'at';
  at: string;
};

type TimeScheduleInput = string | CronTimeScheduleInput | EveryTimeScheduleInput | AtTimeScheduleInput;

type TimeSourceInput = {
  type: 'time';
  schedule: TimeScheduleInput;
  [key: string]: unknown;
};

type CustomSourceInput = {
  type: 'custom';
  resolver: string;
  params: Record<string, unknown>;
  [key: string]: unknown;
};

type DataSourceInput =
  | PriceSourceInput
  | IndicatorSourceInput
  | SpreadSourceInput
  | VolumeSourceInput
  | OrderbookSourceInput
  | VolatilitySourceInput
  | CorrelationSourceInput
  | PortfolioSourceInput
  | NewsSourceInput
  | SentimentSourceInput
  | TimeSourceInput
  | CustomSourceInput;

type WatchConditionInput =
  | {
      op: 'gt' | 'lt' | 'gte' | 'lte' | 'eq';
      value: number;
    }
  | {
      op: 'pct_change';
      window: string;
      direction: 'up' | 'down' | 'either';
      threshold: number;
    }
  | {
      op: 'crosses_above' | 'crosses_below';
      value: number;
    }
  | {
      op: 'enters_range' | 'exits_range';
      low: number;
      high: number;
    }
  | {
      op: 'and' | 'or';
      conditions: WatchConditionInput[];
    }
  | {
      op: 'pattern';
      description: string;
      evalFrequency: string;
    };

type ActionEnvelope = {
  type: string;
  params: Record<string, unknown>;
  metadata?: Record<string, unknown>;
};

type ActionEnvelopeInput = {
  type: string;
  params?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
};

const NumericComparisonConditionSchema = z.object({
  op: z.enum(['gt', 'lt', 'gte', 'lte', 'eq']),
  value: z.number().finite(),
});

const PctChangeConditionSchema = z.object({
  op: z.literal('pct_change'),
  window: z.string().min(1),
  direction: z.enum(['up', 'down', 'either']),
  threshold: z.number().finite(),
});

const CrossesConditionSchema = z.object({
  op: z.enum(['crosses_above', 'crosses_below']),
  value: z.number().finite(),
});

const RangeConditionSchema = z.object({
  op: z.enum(['enters_range', 'exits_range']),
  low: z.number().finite(),
  high: z.number().finite(),
});

const PatternConditionSchema = z.object({
  op: z.literal('pattern'),
  description: z.string().min(1),
  evalFrequency: z.string().min(1),
});

const BaseDataSourceSchema = z.object({
  type: z.string().min(1),
}).catchall(z.unknown());

const TimeScheduleObjectSchema = z.discriminatedUnion('kind', [
  z.object({
    kind: z.literal('cron'),
    expression: z.string().min(1),
  }),
  z.object({
    kind: z.literal('every'),
    interval: z.string().min(1),
  }),
  z.object({
    kind: z.literal('at'),
    at: z.string().datetime({ offset: true }),
  }),
]);

export const PriceSourceSchema = z.object({
  type: z.literal('price'),
  symbol: z.string().trim().min(1),
  field: z.enum(['last', 'bid', 'ask', 'vwap', 'open', 'high', 'low', 'close']),
}).catchall(z.unknown());

export const IndicatorSourceSchema = z.object({
  type: z.literal('indicator'),
  symbol: z.string().trim().min(1),
  timeframe: z.string().trim().min(1).optional(),
  indicator: z.string().trim().min(1),
  params: z.record(z.number().finite()),
}).catchall(z.unknown());

export const SpreadSourceSchema = z.object({
  type: z.literal('spread'),
  symbolA: z.string().trim().min(1),
  symbolB: z.string().trim().min(1),
  calc: z.enum(['ratio', 'diff', 'pct']),
}).catchall(z.unknown());

export const VolumeSourceSchema = z.object({
  type: z.literal('volume'),
  symbol: z.string().trim().min(1),
  window: z.string().trim().min(1),
}).catchall(z.unknown());

export const OrderbookSourceSchema = z.object({
  type: z.literal('orderbook'),
  symbol: z.string().trim().min(1),
  field: z.enum(['depth_imbalance', 'spread_pct', 'bid_wall', 'ask_wall']),
}).catchall(z.unknown());

export const VolatilitySourceSchema = z.object({
  type: z.literal('volatility'),
  symbol: z.string().trim().min(1),
  window: z.string().trim().min(1),
  calc: z.enum(['realized', 'atr', 'iv']),
}).catchall(z.unknown());

export const CorrelationSourceSchema = z.object({
  type: z.literal('correlation'),
  symbolA: z.string().trim().min(1),
  symbolB: z.string().trim().min(1),
  window: z.string().trim().min(1),
}).catchall(z.unknown());

export const PortfolioSourceSchema = z.object({
  type: z.literal('portfolio'),
  field: z.enum(['total_pnl', 'position_pnl', 'drawdown', 'exposure', 'unrealized_pnl']),
  symbol: z.string().trim().min(1).optional(),
}).catchall(z.unknown());

export const NewsSourceSchema = z.object({
  type: z.literal('news'),
  keywords: z.array(z.string().trim().min(1)).min(1),
  sources: z.array(z.string().trim().min(1)).optional(),
}).catchall(z.unknown());

export const SentimentSourceSchema = z.object({
  type: z.literal('sentiment'),
  subject: z.string().trim().min(1),
  sources: z.array(z.string().trim().min(1)).optional(),
  window: z.string().trim().min(1).optional(),
  evalFrequency: z.string().trim().min(1),
}).catchall(z.unknown());

export const TimeSourceSchema = z.object({
  type: z.literal('time'),
  schedule: z.union([
    z.string().trim().min(1),
    TimeScheduleObjectSchema,
  ]),
}).catchall(z.unknown());

export const CustomSourceSchema = z.object({
  type: z.literal('custom'),
  resolver: z.string().trim().min(1),
  params: JsonRecordSchema,
}).catchall(z.unknown());

export const DataSourceSchema = BaseDataSourceSchema.superRefine((source, ctx) => {
  const schemaByType: Record<string, z.ZodTypeAny> = {
    price: PriceSourceSchema,
    indicator: IndicatorSourceSchema,
    spread: SpreadSourceSchema,
    volume: VolumeSourceSchema,
    orderbook: OrderbookSourceSchema,
    volatility: VolatilitySourceSchema,
    correlation: CorrelationSourceSchema,
    portfolio: PortfolioSourceSchema,
    news: NewsSourceSchema,
    sentiment: SentimentSourceSchema,
    time: TimeSourceSchema,
    custom: CustomSourceSchema,
  };

  const schema = schemaByType[source.type];
  if (!schema) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `Unsupported source type: ${source.type}`,
      path: ['type'],
    });
    return;
  }

  const parsed = schema.safeParse(source);
  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      ctx.addIssue(issue);
    }
  }
}) as unknown as z.ZodType<DataSourceInput>;

export const WatchConditionSchema: z.ZodType<WatchConditionInput> = z.lazy(() =>
  z.discriminatedUnion('op', [
    NumericComparisonConditionSchema,
    PctChangeConditionSchema,
    CrossesConditionSchema,
    RangeConditionSchema,
    z.object({
      op: z.enum(['and', 'or']),
      conditions: z.array(WatchConditionSchema),
    }),
    PatternConditionSchema,
  ])
);

const ActionEnvelopeSchema = z.object({
  type: z.string().min(1),
  params: JsonRecordSchema.default({}),
  metadata: JsonRecordSchema.optional(),
});

export const ActionSchema: z.ZodType<ActionEnvelope, z.ZodTypeDef, ActionEnvelopeInput> = ActionEnvelopeSchema;

export const WatchExecutionSchema = z.discriminatedUnion('mode', [
  z.object({
    mode: z.literal('wake_agent'),
  }),
  z.object({
    mode: z.literal('execute_immediately'),
    action: ActionSchema,
  }),
]);

export const WatchTriggerSchema = z.object({
  cooldown: z.string().min(1),
  sustainedFor: z.string().min(1).optional(),
  maxFires: z.union([z.literal(-1), z.number().int().positive()]).optional(),
  fireOnce: z.boolean().optional(),
  activeWindow: z.object({
    days: z.array(z.string()).optional(),
    hoursUTC: z.array(z.number().int()).length(2).optional(),
  }).optional(),
});

export const WatchEvaluationSchema = z.object({
  mode: z.enum(['auto', 'interval', 'realtime']).optional(),
  interval: z.string().min(1).optional(),
});

export const WatchSpecSchema = z.object({
  id: z.string().min(1).optional(),
  agentId: z.string().min(1),
  createdAt: z.string().datetime().optional(),
  expiresAt: z.string().datetime().nullable().optional(),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  label: z.string().optional(),
  source: DataSourceSchema,
  condition: WatchConditionSchema,
  trigger: WatchTriggerSchema,
  evaluation: WatchEvaluationSchema.optional(),
  providers: z.record(z.string().min(1)).optional(),
  execution: WatchExecutionSchema.optional(),
  resumeContext: JsonRecordSchema,
});

export const DispatchErrorInfoSchema = z.object({
  attempt: z.number().int().positive(),
  message: z.string().min(1),
  timestamp: z.string().datetime({ offset: true }),
});

export const DispatchContextSchema = z.object({
  idempotencyKey: z.string().min(1),
  attempt: z.number().int().positive(),
  maxAttempts: z.number().int().positive(),
  retriedAfterErrors: z.number().int().min(0),
  priorErrors: z.array(DispatchErrorInfoSchema).default([]),
});

export function normalizeWatchTrigger<T extends Record<string, unknown>>(
  trigger: T,
): Omit<T, 'fireOnce'> {
  const { fireOnce, maxFires, ...rest } = trigger;
  if (fireOnce) {
    return {
      ...rest,
      maxFires: 1,
    } as Omit<T, 'fireOnce'>;
  }

  if (maxFires === -1) {
    return rest as Omit<T, 'fireOnce'>;
  }

  return {
    ...rest,
    ...(maxFires === undefined ? {} : { maxFires }),
  } as Omit<T, 'fireOnce'>;
}

function normalizeTimeSchedule(
  schedule: TimeScheduleInput,
): CronTimeScheduleInput | EveryTimeScheduleInput | AtTimeScheduleInput {
  if (typeof schedule === 'string') {
    return {
      kind: 'cron',
      expression: schedule.trim(),
    };
  }

  switch (schedule.kind) {
    case 'cron':
      return {
        kind: 'cron',
        expression: schedule.expression.trim(),
      };
    case 'every':
      return {
        kind: 'every',
        interval: normalizeDurationString(schedule.interval) ?? schedule.interval.trim(),
      };
    case 'at':
      return {
        kind: 'at',
        at: new Date(schedule.at).toISOString(),
      };
  }
}

function normalizeTimeSource<T extends Record<string, unknown>>(source: T): T {
  if (source.type !== 'time' || !('schedule' in source)) {
    return source;
  }

  const schedule = (source as unknown as { schedule: TimeScheduleInput }).schedule;
  return {
    ...source,
    schedule: normalizeTimeSchedule(schedule),
  } as T;
}

export function normalizeWatchSpec<T extends Record<string, unknown>>(
  spec: T,
): T {
  const trigger = spec.trigger;
  const source = spec.source;

  return {
    ...spec,
    ...(source && typeof source === 'object' && !Array.isArray(source)
      ? { source: normalizeTimeSource(source as Record<string, unknown>) }
      : {}),
    ...(trigger && typeof trigger === 'object' && !Array.isArray(trigger)
      ? { trigger: normalizeWatchTrigger(trigger as Record<string, unknown>) }
      : {}),
  } as T;
}

const WakePayloadBaseSchema = z.object({
  watchSpec: JsonRecordSchema,
  triggeredAt: z.string().datetime({ offset: true }),
  currentValue: z.number().finite(),
  snapshot: JsonRecordSchema.optional(),
  sourceSnapshot: JsonRecordSchema.optional(),
  marketSnapshot: JsonRecordSchema.optional(),
  resumeContext: JsonRecordSchema.optional(),
  dispatchContext: DispatchContextSchema.optional(),
});

export const WakePayloadSchema = WakePayloadBaseSchema.transform(({ snapshot, sourceSnapshot, marketSnapshot, resumeContext, dispatchContext, ...rest }: z.input<typeof WakePayloadBaseSchema>) => ({
  ...rest,
  snapshot: snapshot ?? sourceSnapshot ?? marketSnapshot ?? {},
  resumeContext: resumeContext ?? {},
  ...(dispatchContext ? { dispatchContext } : {}),
}));

export type Action = z.infer<typeof ActionSchema>;
export type WatchExecution = z.infer<typeof WatchExecutionSchema>;
export type DataSource = z.infer<typeof DataSourceSchema>;
export type TimeSource = z.infer<typeof TimeSourceSchema>;
export type CustomSource = z.infer<typeof CustomSourceSchema>;
export type WatchCondition = z.infer<typeof WatchConditionSchema>;
export type WatchSpec = z.infer<typeof WatchSpecSchema>;
export type WakePayload = z.infer<typeof WakePayloadSchema>;
