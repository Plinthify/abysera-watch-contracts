import { z } from 'zod';

declare const JsonRecordSchema: z.ZodRecord<z.ZodString, z.ZodUnknown>;
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
type WatchConditionInput = {
    op: 'gt' | 'lt' | 'gte' | 'lte' | 'eq';
    value: number;
} | {
    op: 'pct_change';
    window: string;
    direction: 'up' | 'down' | 'either';
    threshold: number;
} | {
    op: 'crosses_above' | 'crosses_below';
    value: number;
} | {
    op: 'enters_range' | 'exits_range';
    low: number;
    high: number;
} | {
    op: 'and' | 'or';
    conditions: WatchConditionInput[];
} | {
    op: 'pattern';
    description: string;
    evalFrequency: string;
};
declare const TimeSourceSchema: z.ZodObject<{
    type: z.ZodLiteral<"time">;
    schedule: z.ZodString;
}, "strip", z.ZodUnknown, z.objectOutputType<{
    type: z.ZodLiteral<"time">;
    schedule: z.ZodString;
}, z.ZodUnknown, "strip">, z.objectInputType<{
    type: z.ZodLiteral<"time">;
    schedule: z.ZodString;
}, z.ZodUnknown, "strip">>;
declare const CustomSourceSchema: z.ZodObject<{
    type: z.ZodLiteral<"custom">;
    resolver: z.ZodString;
    params: z.ZodRecord<z.ZodString, z.ZodUnknown>;
}, "strip", z.ZodUnknown, z.objectOutputType<{
    type: z.ZodLiteral<"custom">;
    resolver: z.ZodString;
    params: z.ZodRecord<z.ZodString, z.ZodUnknown>;
}, z.ZodUnknown, "strip">, z.objectInputType<{
    type: z.ZodLiteral<"custom">;
    resolver: z.ZodString;
    params: z.ZodRecord<z.ZodString, z.ZodUnknown>;
}, z.ZodUnknown, "strip">>;
declare const DataSourceSchema: z.ZodType<DataSourceInput>;
declare const WatchConditionSchema: z.ZodType<WatchConditionInput>;
declare const TradeActionSchema: z.ZodObject<{
    type: z.ZodEnum<["market_order", "limit_order", "cancel_order", "modify_order"]>;
    symbol: z.ZodString;
    side: z.ZodEnum<["buy", "sell"]>;
    quantity: z.ZodNumber;
    price: z.ZodOptional<z.ZodNumber>;
    stopLoss: z.ZodOptional<z.ZodNumber>;
    takeProfit: z.ZodOptional<z.ZodNumber>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, "strip", z.ZodTypeAny, {
    symbol: string;
    type: "market_order" | "limit_order" | "cancel_order" | "modify_order";
    side: "buy" | "sell";
    quantity: number;
    price?: number | undefined;
    stopLoss?: number | undefined;
    takeProfit?: number | undefined;
    metadata?: Record<string, unknown> | undefined;
}, {
    symbol: string;
    type: "market_order" | "limit_order" | "cancel_order" | "modify_order";
    side: "buy" | "sell";
    quantity: number;
    price?: number | undefined;
    stopLoss?: number | undefined;
    takeProfit?: number | undefined;
    metadata?: Record<string, unknown> | undefined;
}>;
declare const WatchExecutionSchema: z.ZodDiscriminatedUnion<"mode", [z.ZodObject<{
    mode: z.ZodLiteral<"wake_agent">;
}, "strip", z.ZodTypeAny, {
    mode: "wake_agent";
}, {
    mode: "wake_agent";
}>, z.ZodObject<{
    mode: z.ZodLiteral<"execute_immediately">;
    action: z.ZodObject<{
        type: z.ZodEnum<["market_order", "limit_order", "cancel_order", "modify_order"]>;
        symbol: z.ZodString;
        side: z.ZodEnum<["buy", "sell"]>;
        quantity: z.ZodNumber;
        price: z.ZodOptional<z.ZodNumber>;
        stopLoss: z.ZodOptional<z.ZodNumber>;
        takeProfit: z.ZodOptional<z.ZodNumber>;
        metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    }, "strip", z.ZodTypeAny, {
        symbol: string;
        type: "market_order" | "limit_order" | "cancel_order" | "modify_order";
        side: "buy" | "sell";
        quantity: number;
        price?: number | undefined;
        stopLoss?: number | undefined;
        takeProfit?: number | undefined;
        metadata?: Record<string, unknown> | undefined;
    }, {
        symbol: string;
        type: "market_order" | "limit_order" | "cancel_order" | "modify_order";
        side: "buy" | "sell";
        quantity: number;
        price?: number | undefined;
        stopLoss?: number | undefined;
        takeProfit?: number | undefined;
        metadata?: Record<string, unknown> | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    mode: "execute_immediately";
    action: {
        symbol: string;
        type: "market_order" | "limit_order" | "cancel_order" | "modify_order";
        side: "buy" | "sell";
        quantity: number;
        price?: number | undefined;
        stopLoss?: number | undefined;
        takeProfit?: number | undefined;
        metadata?: Record<string, unknown> | undefined;
    };
}, {
    mode: "execute_immediately";
    action: {
        symbol: string;
        type: "market_order" | "limit_order" | "cancel_order" | "modify_order";
        side: "buy" | "sell";
        quantity: number;
        price?: number | undefined;
        stopLoss?: number | undefined;
        takeProfit?: number | undefined;
        metadata?: Record<string, unknown> | undefined;
    };
}>]>;
declare const WatchTriggerSchema: z.ZodObject<{
    cooldown: z.ZodString;
    sustainedFor: z.ZodOptional<z.ZodString>;
    maxFires: z.ZodOptional<z.ZodNumber>;
    fireOnce: z.ZodOptional<z.ZodBoolean>;
    activeWindow: z.ZodOptional<z.ZodObject<{
        days: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        hoursUTC: z.ZodOptional<z.ZodTuple<[z.ZodNumber, z.ZodNumber], null>>;
    }, "strip", z.ZodTypeAny, {
        days?: string[] | undefined;
        hoursUTC?: [number, number] | undefined;
    }, {
        days?: string[] | undefined;
        hoursUTC?: [number, number] | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    cooldown: string;
    sustainedFor?: string | undefined;
    maxFires?: number | undefined;
    fireOnce?: boolean | undefined;
    activeWindow?: {
        days?: string[] | undefined;
        hoursUTC?: [number, number] | undefined;
    } | undefined;
}, {
    cooldown: string;
    sustainedFor?: string | undefined;
    maxFires?: number | undefined;
    fireOnce?: boolean | undefined;
    activeWindow?: {
        days?: string[] | undefined;
        hoursUTC?: [number, number] | undefined;
    } | undefined;
}>;
declare const WatchEvaluationSchema: z.ZodObject<{
    mode: z.ZodOptional<z.ZodEnum<["auto", "interval", "realtime"]>>;
    interval: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    mode?: "auto" | "interval" | "realtime" | undefined;
    interval?: string | undefined;
}, {
    mode?: "auto" | "interval" | "realtime" | undefined;
    interval?: string | undefined;
}>;
declare const WatchSpecSchema: z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    agentId: z.ZodString;
    createdAt: z.ZodOptional<z.ZodString>;
    expiresAt: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    priority: z.ZodEnum<["low", "medium", "high", "critical"]>;
    label: z.ZodOptional<z.ZodString>;
    source: z.ZodType<DataSourceInput, z.ZodTypeDef, DataSourceInput>;
    condition: z.ZodType<WatchConditionInput, z.ZodTypeDef, WatchConditionInput>;
    trigger: z.ZodObject<{
        cooldown: z.ZodString;
        sustainedFor: z.ZodOptional<z.ZodString>;
        maxFires: z.ZodOptional<z.ZodNumber>;
        fireOnce: z.ZodOptional<z.ZodBoolean>;
        activeWindow: z.ZodOptional<z.ZodObject<{
            days: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            hoursUTC: z.ZodOptional<z.ZodTuple<[z.ZodNumber, z.ZodNumber], null>>;
        }, "strip", z.ZodTypeAny, {
            days?: string[] | undefined;
            hoursUTC?: [number, number] | undefined;
        }, {
            days?: string[] | undefined;
            hoursUTC?: [number, number] | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        cooldown: string;
        sustainedFor?: string | undefined;
        maxFires?: number | undefined;
        fireOnce?: boolean | undefined;
        activeWindow?: {
            days?: string[] | undefined;
            hoursUTC?: [number, number] | undefined;
        } | undefined;
    }, {
        cooldown: string;
        sustainedFor?: string | undefined;
        maxFires?: number | undefined;
        fireOnce?: boolean | undefined;
        activeWindow?: {
            days?: string[] | undefined;
            hoursUTC?: [number, number] | undefined;
        } | undefined;
    }>;
    evaluation: z.ZodOptional<z.ZodObject<{
        mode: z.ZodOptional<z.ZodEnum<["auto", "interval", "realtime"]>>;
        interval: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        mode?: "auto" | "interval" | "realtime" | undefined;
        interval?: string | undefined;
    }, {
        mode?: "auto" | "interval" | "realtime" | undefined;
        interval?: string | undefined;
    }>>;
    providers: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
    execution: z.ZodOptional<z.ZodDiscriminatedUnion<"mode", [z.ZodObject<{
        mode: z.ZodLiteral<"wake_agent">;
    }, "strip", z.ZodTypeAny, {
        mode: "wake_agent";
    }, {
        mode: "wake_agent";
    }>, z.ZodObject<{
        mode: z.ZodLiteral<"execute_immediately">;
        action: z.ZodObject<{
            type: z.ZodEnum<["market_order", "limit_order", "cancel_order", "modify_order"]>;
            symbol: z.ZodString;
            side: z.ZodEnum<["buy", "sell"]>;
            quantity: z.ZodNumber;
            price: z.ZodOptional<z.ZodNumber>;
            stopLoss: z.ZodOptional<z.ZodNumber>;
            takeProfit: z.ZodOptional<z.ZodNumber>;
            metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
        }, "strip", z.ZodTypeAny, {
            symbol: string;
            type: "market_order" | "limit_order" | "cancel_order" | "modify_order";
            side: "buy" | "sell";
            quantity: number;
            price?: number | undefined;
            stopLoss?: number | undefined;
            takeProfit?: number | undefined;
            metadata?: Record<string, unknown> | undefined;
        }, {
            symbol: string;
            type: "market_order" | "limit_order" | "cancel_order" | "modify_order";
            side: "buy" | "sell";
            quantity: number;
            price?: number | undefined;
            stopLoss?: number | undefined;
            takeProfit?: number | undefined;
            metadata?: Record<string, unknown> | undefined;
        }>;
    }, "strip", z.ZodTypeAny, {
        mode: "execute_immediately";
        action: {
            symbol: string;
            type: "market_order" | "limit_order" | "cancel_order" | "modify_order";
            side: "buy" | "sell";
            quantity: number;
            price?: number | undefined;
            stopLoss?: number | undefined;
            takeProfit?: number | undefined;
            metadata?: Record<string, unknown> | undefined;
        };
    }, {
        mode: "execute_immediately";
        action: {
            symbol: string;
            type: "market_order" | "limit_order" | "cancel_order" | "modify_order";
            side: "buy" | "sell";
            quantity: number;
            price?: number | undefined;
            stopLoss?: number | undefined;
            takeProfit?: number | undefined;
            metadata?: Record<string, unknown> | undefined;
        };
    }>]>>;
    resumeContext: z.ZodRecord<z.ZodString, z.ZodUnknown>;
}, "strip", z.ZodTypeAny, {
    agentId: string;
    priority: "low" | "high" | "medium" | "critical";
    source: DataSourceInput;
    condition: WatchConditionInput;
    trigger: {
        cooldown: string;
        sustainedFor?: string | undefined;
        maxFires?: number | undefined;
        fireOnce?: boolean | undefined;
        activeWindow?: {
            days?: string[] | undefined;
            hoursUTC?: [number, number] | undefined;
        } | undefined;
    };
    resumeContext: Record<string, unknown>;
    id?: string | undefined;
    createdAt?: string | undefined;
    expiresAt?: string | null | undefined;
    label?: string | undefined;
    evaluation?: {
        mode?: "auto" | "interval" | "realtime" | undefined;
        interval?: string | undefined;
    } | undefined;
    providers?: Record<string, string> | undefined;
    execution?: {
        mode: "wake_agent";
    } | {
        mode: "execute_immediately";
        action: {
            symbol: string;
            type: "market_order" | "limit_order" | "cancel_order" | "modify_order";
            side: "buy" | "sell";
            quantity: number;
            price?: number | undefined;
            stopLoss?: number | undefined;
            takeProfit?: number | undefined;
            metadata?: Record<string, unknown> | undefined;
        };
    } | undefined;
}, {
    agentId: string;
    priority: "low" | "high" | "medium" | "critical";
    source: DataSourceInput;
    condition: WatchConditionInput;
    trigger: {
        cooldown: string;
        sustainedFor?: string | undefined;
        maxFires?: number | undefined;
        fireOnce?: boolean | undefined;
        activeWindow?: {
            days?: string[] | undefined;
            hoursUTC?: [number, number] | undefined;
        } | undefined;
    };
    resumeContext: Record<string, unknown>;
    id?: string | undefined;
    createdAt?: string | undefined;
    expiresAt?: string | null | undefined;
    label?: string | undefined;
    evaluation?: {
        mode?: "auto" | "interval" | "realtime" | undefined;
        interval?: string | undefined;
    } | undefined;
    providers?: Record<string, string> | undefined;
    execution?: {
        mode: "wake_agent";
    } | {
        mode: "execute_immediately";
        action: {
            symbol: string;
            type: "market_order" | "limit_order" | "cancel_order" | "modify_order";
            side: "buy" | "sell";
            quantity: number;
            price?: number | undefined;
            stopLoss?: number | undefined;
            takeProfit?: number | undefined;
            metadata?: Record<string, unknown> | undefined;
        };
    } | undefined;
}>;
declare function normalizeWatchTrigger<T extends Record<string, unknown>>(trigger: T): Omit<T, 'fireOnce'>;
declare function normalizeWatchSpec<T extends Record<string, unknown>>(spec: T): T;
declare const WakePayloadSchema: z.ZodEffects<z.ZodObject<{
    watchSpec: z.ZodRecord<z.ZodString, z.ZodUnknown>;
    triggeredAt: z.ZodString;
    currentValue: z.ZodNumber;
    snapshot: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    sourceSnapshot: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    marketSnapshot: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    resumeContext: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, "strip", z.ZodTypeAny, {
    watchSpec: Record<string, unknown>;
    triggeredAt: string;
    currentValue: number;
    resumeContext?: Record<string, unknown> | undefined;
    snapshot?: Record<string, unknown> | undefined;
    sourceSnapshot?: Record<string, unknown> | undefined;
    marketSnapshot?: Record<string, unknown> | undefined;
}, {
    watchSpec: Record<string, unknown>;
    triggeredAt: string;
    currentValue: number;
    resumeContext?: Record<string, unknown> | undefined;
    snapshot?: Record<string, unknown> | undefined;
    sourceSnapshot?: Record<string, unknown> | undefined;
    marketSnapshot?: Record<string, unknown> | undefined;
}>, {
    snapshot: Record<string, unknown>;
    resumeContext: Record<string, unknown>;
    watchSpec: Record<string, unknown>;
    triggeredAt: string;
    currentValue: number;
}, {
    watchSpec: Record<string, unknown>;
    triggeredAt: string;
    currentValue: number;
    resumeContext?: Record<string, unknown> | undefined;
    snapshot?: Record<string, unknown> | undefined;
    sourceSnapshot?: Record<string, unknown> | undefined;
    marketSnapshot?: Record<string, unknown> | undefined;
}>;
type TradeAction = z.infer<typeof TradeActionSchema>;
type WatchExecution = z.infer<typeof WatchExecutionSchema>;
type DataSource = z.infer<typeof DataSourceSchema>;
type TimeSource = z.infer<typeof TimeSourceSchema>;
type CustomSource = z.infer<typeof CustomSourceSchema>;
type WatchCondition = z.infer<typeof WatchConditionSchema>;
type WatchSpec = z.infer<typeof WatchSpecSchema>;
type WakePayload = z.infer<typeof WakePayloadSchema>;

export { type CustomSource, CustomSourceSchema, type DataSource, DataSourceSchema, JsonRecordSchema, type TimeSource, TimeSourceSchema, type TradeAction, TradeActionSchema, type WakePayload, WakePayloadSchema, type WatchCondition, WatchConditionSchema, WatchEvaluationSchema, type WatchExecution, WatchExecutionSchema, type WatchSpec, WatchSpecSchema, WatchTriggerSchema, normalizeWatchSpec, normalizeWatchTrigger };
