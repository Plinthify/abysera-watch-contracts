// src/index.ts
import { z } from "zod";
var JsonRecordSchema = z.record(z.unknown());
var NumericComparisonConditionSchema = z.object({
  op: z.enum(["gt", "lt", "gte", "lte", "eq"]),
  value: z.number().finite()
});
var PctChangeConditionSchema = z.object({
  op: z.literal("pct_change"),
  window: z.string().min(1),
  direction: z.enum(["up", "down", "either"]),
  threshold: z.number().finite()
});
var CrossesConditionSchema = z.object({
  op: z.enum(["crosses_above", "crosses_below"]),
  value: z.number().finite()
});
var RangeConditionSchema = z.object({
  op: z.enum(["enters_range", "exits_range"]),
  low: z.number().finite(),
  high: z.number().finite()
});
var PatternConditionSchema = z.object({
  op: z.literal("pattern"),
  description: z.string().min(1),
  evalFrequency: z.string().min(1)
});
var BaseDataSourceSchema = z.object({
  type: z.string().min(1)
}).catchall(z.unknown());
var TimeSourceSchema = z.object({
  type: z.literal("time"),
  schedule: z.string().min(1)
}).catchall(z.unknown());
var CustomSourceSchema = z.object({
  type: z.literal("custom"),
  resolver: z.string().min(1),
  params: JsonRecordSchema
}).catchall(z.unknown());
var DataSourceSchema = BaseDataSourceSchema.superRefine((source, ctx) => {
  if (source.type === "time") {
    const parsed = TimeSourceSchema.safeParse(source);
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        ctx.addIssue(issue);
      }
    }
    return;
  }
  if (source.type === "custom") {
    const parsed = CustomSourceSchema.safeParse(source);
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        ctx.addIssue(issue);
      }
    }
  }
});
var WatchConditionSchema = z.lazy(
  () => z.discriminatedUnion("op", [
    NumericComparisonConditionSchema,
    PctChangeConditionSchema,
    CrossesConditionSchema,
    RangeConditionSchema,
    z.object({
      op: z.enum(["and", "or"]),
      conditions: z.array(WatchConditionSchema)
    }),
    PatternConditionSchema
  ])
);
var TradeActionSchema = z.object({
  type: z.enum(["market_order", "limit_order", "cancel_order", "modify_order"]),
  symbol: z.string().min(1),
  side: z.enum(["buy", "sell"]),
  quantity: z.number().positive(),
  price: z.number().positive().optional(),
  stopLoss: z.number().positive().optional(),
  takeProfit: z.number().positive().optional(),
  metadata: JsonRecordSchema.optional()
});
var WatchExecutionSchema = z.discriminatedUnion("mode", [
  z.object({
    mode: z.literal("wake_agent")
  }),
  z.object({
    mode: z.literal("execute_immediately"),
    action: TradeActionSchema
  })
]);
var WatchTriggerSchema = z.object({
  cooldown: z.string().min(1),
  sustainedFor: z.string().min(1).optional(),
  maxFires: z.number().int().positive().optional(),
  fireOnce: z.boolean().optional(),
  activeWindow: z.object({
    days: z.array(z.string()).optional(),
    hoursUTC: z.tuple([z.number().int(), z.number().int()]).optional()
  }).optional()
});
var WatchEvaluationSchema = z.object({
  mode: z.enum(["auto", "interval", "realtime"]).optional(),
  interval: z.string().min(1).optional()
});
var WatchSpecSchema = z.object({
  id: z.string().min(1).optional(),
  agentId: z.string().min(1),
  createdAt: z.string().datetime().optional(),
  expiresAt: z.string().datetime().nullable().optional(),
  priority: z.enum(["low", "medium", "high", "critical"]),
  label: z.string().optional(),
  source: DataSourceSchema,
  condition: WatchConditionSchema,
  trigger: WatchTriggerSchema,
  evaluation: WatchEvaluationSchema.optional(),
  providers: z.record(z.string().min(1)).optional(),
  execution: WatchExecutionSchema.optional(),
  resumeContext: JsonRecordSchema
});
function normalizeWatchTrigger(trigger) {
  const { fireOnce, ...rest } = trigger;
  if (fireOnce) {
    return {
      ...rest,
      maxFires: 1
    };
  }
  return rest;
}
function normalizeWatchSpec(spec) {
  const trigger = spec.trigger;
  if (!trigger || typeof trigger !== "object" || Array.isArray(trigger)) {
    return spec;
  }
  return {
    ...spec,
    trigger: normalizeWatchTrigger(trigger)
  };
}
var WakePayloadBaseSchema = z.object({
  watchSpec: JsonRecordSchema,
  triggeredAt: z.string().datetime({ offset: true }),
  currentValue: z.number().finite(),
  snapshot: JsonRecordSchema.optional(),
  sourceSnapshot: JsonRecordSchema.optional(),
  marketSnapshot: JsonRecordSchema.optional(),
  resumeContext: JsonRecordSchema.optional()
});
var WakePayloadSchema = WakePayloadBaseSchema.transform(({ snapshot, sourceSnapshot, marketSnapshot, resumeContext, ...rest }) => ({
  ...rest,
  snapshot: snapshot ?? sourceSnapshot ?? marketSnapshot ?? {},
  resumeContext: resumeContext ?? {}
}));
export {
  CustomSourceSchema,
  DataSourceSchema,
  JsonRecordSchema,
  TimeSourceSchema,
  TradeActionSchema,
  WakePayloadSchema,
  WatchConditionSchema,
  WatchEvaluationSchema,
  WatchExecutionSchema,
  WatchSpecSchema,
  WatchTriggerSchema,
  normalizeWatchSpec,
  normalizeWatchTrigger
};
//# sourceMappingURL=index.js.map