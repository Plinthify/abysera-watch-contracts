import { z } from 'zod';

export const JsonRecordSchema = z.record(z.unknown());

type BaseDataSourceInput = {
  type: string;
  [key: string]: unknown;
};

type TimeSourceInput = {
  type: 'time';
  schedule: string;
};

type CustomSourceInput = {
  type: 'custom';
  resolver: string;
  params: Record<string, unknown>;
};

type DataSourceInput = BaseDataSourceInput | TimeSourceInput | CustomSourceInput;

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

export const TimeSourceSchema = z.object({
  type: z.literal('time'),
  schedule: z.string().min(1),
}).catchall(z.unknown());

export const CustomSourceSchema = z.object({
  type: z.literal('custom'),
  resolver: z.string().min(1),
  params: JsonRecordSchema,
}).catchall(z.unknown());

export const DataSourceSchema: z.ZodType<DataSourceInput> = BaseDataSourceSchema.superRefine((source, ctx) => {
  if (source.type === 'time') {
    const parsed = TimeSourceSchema.safeParse(source);
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        ctx.addIssue(issue);
      }
    }
    return;
  }

  if (source.type === 'custom') {
    const parsed = CustomSourceSchema.safeParse(source);
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        ctx.addIssue(issue);
      }
    }
  }
});

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

export const TradeActionSchema = z.object({
  type: z.enum(['market_order', 'limit_order', 'cancel_order', 'modify_order']),
  symbol: z.string().min(1),
  side: z.enum(['buy', 'sell']),
  quantity: z.number().positive(),
  price: z.number().positive().optional(),
  stopLoss: z.number().positive().optional(),
  takeProfit: z.number().positive().optional(),
  metadata: JsonRecordSchema.optional(),
});

export const WatchExecutionSchema = z.discriminatedUnion('mode', [
  z.object({
    mode: z.literal('wake_agent'),
  }),
  z.object({
    mode: z.literal('execute_immediately'),
    action: TradeActionSchema,
  }),
]);

export const WatchTriggerSchema = z.object({
  cooldown: z.string().min(1),
  sustainedFor: z.string().min(1).optional(),
  maxFires: z.number().int().positive().optional(),
  fireOnce: z.boolean().optional(),
  activeWindow: z.object({
    days: z.array(z.string()).optional(),
    hoursUTC: z.tuple([z.number().int(), z.number().int()]).optional(),
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

export function normalizeWatchTrigger<T extends Record<string, unknown>>(
  trigger: T,
): Omit<T, 'fireOnce'> {
  const { fireOnce, ...rest } = trigger;
  if (fireOnce) {
    return {
      ...rest,
      maxFires: 1,
    } as Omit<T, 'fireOnce'>;
  }

  return rest as Omit<T, 'fireOnce'>;
}

export function normalizeWatchSpec<T extends Record<string, unknown>>(
  spec: T,
): T {
  const trigger = spec.trigger;
  if (!trigger || typeof trigger !== 'object' || Array.isArray(trigger)) {
    return spec;
  }

  return {
    ...spec,
    trigger: normalizeWatchTrigger(trigger as Record<string, unknown>),
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
});

export const WakePayloadSchema = WakePayloadBaseSchema.transform(({ snapshot, sourceSnapshot, marketSnapshot, resumeContext, ...rest }: z.input<typeof WakePayloadBaseSchema>) => ({
  ...rest,
  snapshot: snapshot ?? sourceSnapshot ?? marketSnapshot ?? {},
  resumeContext: resumeContext ?? {},
}));

export type TradeAction = z.infer<typeof TradeActionSchema>;
export type WatchExecution = z.infer<typeof WatchExecutionSchema>;
export type DataSource = z.infer<typeof DataSourceSchema>;
export type TimeSource = z.infer<typeof TimeSourceSchema>;
export type CustomSource = z.infer<typeof CustomSourceSchema>;
export type WatchCondition = z.infer<typeof WatchConditionSchema>;
export type WatchSpec = z.infer<typeof WatchSpecSchema>;
export type WakePayload = z.infer<typeof WakePayloadSchema>;
