"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  CustomSourceSchema: () => CustomSourceSchema,
  DataSourceSchema: () => DataSourceSchema,
  JsonRecordSchema: () => JsonRecordSchema,
  TimeSourceSchema: () => TimeSourceSchema,
  TradeActionSchema: () => TradeActionSchema,
  WakePayloadSchema: () => WakePayloadSchema,
  WatchConditionSchema: () => WatchConditionSchema,
  WatchEvaluationSchema: () => WatchEvaluationSchema,
  WatchExecutionSchema: () => WatchExecutionSchema,
  WatchSpecSchema: () => WatchSpecSchema,
  WatchTriggerSchema: () => WatchTriggerSchema,
  normalizeWatchSpec: () => normalizeWatchSpec,
  normalizeWatchTrigger: () => normalizeWatchTrigger
});
module.exports = __toCommonJS(index_exports);
var import_zod = require("zod");
var JsonRecordSchema = import_zod.z.record(import_zod.z.unknown());
var NumericComparisonConditionSchema = import_zod.z.object({
  op: import_zod.z.enum(["gt", "lt", "gte", "lte", "eq"]),
  value: import_zod.z.number().finite()
});
var PctChangeConditionSchema = import_zod.z.object({
  op: import_zod.z.literal("pct_change"),
  window: import_zod.z.string().min(1),
  direction: import_zod.z.enum(["up", "down", "either"]),
  threshold: import_zod.z.number().finite()
});
var CrossesConditionSchema = import_zod.z.object({
  op: import_zod.z.enum(["crosses_above", "crosses_below"]),
  value: import_zod.z.number().finite()
});
var RangeConditionSchema = import_zod.z.object({
  op: import_zod.z.enum(["enters_range", "exits_range"]),
  low: import_zod.z.number().finite(),
  high: import_zod.z.number().finite()
});
var PatternConditionSchema = import_zod.z.object({
  op: import_zod.z.literal("pattern"),
  description: import_zod.z.string().min(1),
  evalFrequency: import_zod.z.string().min(1)
});
var BaseDataSourceSchema = import_zod.z.object({
  type: import_zod.z.string().min(1)
}).catchall(import_zod.z.unknown());
var TimeSourceSchema = import_zod.z.object({
  type: import_zod.z.literal("time"),
  schedule: import_zod.z.string().min(1)
}).catchall(import_zod.z.unknown());
var CustomSourceSchema = import_zod.z.object({
  type: import_zod.z.literal("custom"),
  resolver: import_zod.z.string().min(1),
  params: JsonRecordSchema
}).catchall(import_zod.z.unknown());
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
var WatchConditionSchema = import_zod.z.lazy(
  () => import_zod.z.discriminatedUnion("op", [
    NumericComparisonConditionSchema,
    PctChangeConditionSchema,
    CrossesConditionSchema,
    RangeConditionSchema,
    import_zod.z.object({
      op: import_zod.z.enum(["and", "or"]),
      conditions: import_zod.z.array(WatchConditionSchema)
    }),
    PatternConditionSchema
  ])
);
var TradeActionSchema = import_zod.z.object({
  type: import_zod.z.enum(["market_order", "limit_order", "cancel_order", "modify_order"]),
  symbol: import_zod.z.string().min(1),
  side: import_zod.z.enum(["buy", "sell"]),
  quantity: import_zod.z.number().positive(),
  price: import_zod.z.number().positive().optional(),
  stopLoss: import_zod.z.number().positive().optional(),
  takeProfit: import_zod.z.number().positive().optional(),
  metadata: JsonRecordSchema.optional()
});
var WatchExecutionSchema = import_zod.z.discriminatedUnion("mode", [
  import_zod.z.object({
    mode: import_zod.z.literal("wake_agent")
  }),
  import_zod.z.object({
    mode: import_zod.z.literal("execute_immediately"),
    action: TradeActionSchema
  })
]);
var WatchTriggerSchema = import_zod.z.object({
  cooldown: import_zod.z.string().min(1),
  sustainedFor: import_zod.z.string().min(1).optional(),
  maxFires: import_zod.z.number().int().positive().optional(),
  fireOnce: import_zod.z.boolean().optional(),
  activeWindow: import_zod.z.object({
    days: import_zod.z.array(import_zod.z.string()).optional(),
    hoursUTC: import_zod.z.tuple([import_zod.z.number().int(), import_zod.z.number().int()]).optional()
  }).optional()
});
var WatchEvaluationSchema = import_zod.z.object({
  mode: import_zod.z.enum(["auto", "interval", "realtime"]).optional(),
  interval: import_zod.z.string().min(1).optional()
});
var WatchSpecSchema = import_zod.z.object({
  id: import_zod.z.string().min(1).optional(),
  agentId: import_zod.z.string().min(1),
  createdAt: import_zod.z.string().datetime().optional(),
  expiresAt: import_zod.z.string().datetime().nullable().optional(),
  priority: import_zod.z.enum(["low", "medium", "high", "critical"]),
  label: import_zod.z.string().optional(),
  source: DataSourceSchema,
  condition: WatchConditionSchema,
  trigger: WatchTriggerSchema,
  evaluation: WatchEvaluationSchema.optional(),
  providers: import_zod.z.record(import_zod.z.string().min(1)).optional(),
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
var WakePayloadBaseSchema = import_zod.z.object({
  watchSpec: JsonRecordSchema,
  triggeredAt: import_zod.z.string().datetime({ offset: true }),
  currentValue: import_zod.z.number().finite(),
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
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
});
//# sourceMappingURL=index.cjs.map