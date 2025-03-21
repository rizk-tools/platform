import { integer, pgTable, varchar, text, timestamp, boolean, jsonb, uuid, primaryKey, serial } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').notNull(),
  image: text('image'),
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at').notNull()
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp('expires_at').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at').notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' })
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  accessTokenExpiresAt: timestamp('access_token_expires_at'),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at').notNull()
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at'),
  updatedAt: timestamp('updated_at')
});

export const userRelations = relations(user, ({ many }) => ({
  policies: many(policiesTable),
  auditLogs: many(auditLogsTable),
}));

export const policiesTable = pgTable("policies", {
  id: uuid().primaryKey().defaultRandom(),
  name: varchar({ length: 255 }).notNull(),
  description: text(),
  type: varchar({ length: 50 }).notNull(), // e.g., "GDPR", "HIPAA", "SOC2", "custom"
  isActive: boolean().default(true),
  content: jsonb().notNull(), // JSON structure containing the policy rules
  version: varchar({ length: 50 }).notNull(),
  createdById: text().references(() => user.id),
  createdAt: timestamp().defaultNow(),
  updatedAt: timestamp().defaultNow(),
});

export const policyRelations = relations(policiesTable, ({ one, many }) => ({
  createdBy: one(user, {
    fields: [policiesTable.createdById],
    references: [user.id],
  }),
  policyRules: many(policyRulesTable),
  deployments: many(policyDeploymentsTable),
}));

export const policyRulesTable = pgTable("policy_rules", {
  id: uuid().primaryKey().defaultRandom(),
  policyId: uuid().notNull().references(() => policiesTable.id, { onDelete: "cascade" }),
  name: varchar({ length: 255 }).notNull(),
  description: text(),
  ruleDefinition: jsonb().notNull(), // JSON structure containing the rule definition
  priority: integer().default(0),
  isActive: boolean().default(true),
  createdAt: timestamp().defaultNow(),
  updatedAt: timestamp().defaultNow(),
});

export const policyRuleRelations = relations(policyRulesTable, ({ one }) => ({
  policy: one(policiesTable, {
    fields: [policyRulesTable.policyId],
    references: [policiesTable.id],
  }),
}));

export const aiModelsTable = pgTable("ai_models", {
  id: uuid().primaryKey().defaultRandom(),
  name: varchar({ length: 255 }).notNull(),
  provider: varchar({ length: 100 }).notNull(), // e.g., "OpenAI", "Anthropic", "Mistral", "HuggingFace"
  version: varchar({ length: 100 }),
  description: text(),
  parameters: jsonb(), // Model-specific parameters
  createdAt: timestamp().defaultNow(),
  updatedAt: timestamp().defaultNow(),
});

export const aiModelRelations = relations(aiModelsTable, ({ many }) => ({
  deployments: many(policyDeploymentsTable),
  requests: many(aiRequestsTable),
}));

export const policyDeploymentsTable = pgTable("policy_deployments", {
  id: uuid().primaryKey().defaultRandom(),
  policyId: uuid().notNull().references(() => policiesTable.id),
  aiModelId: uuid().references(() => aiModelsTable.id),
  environment: varchar({ length: 50 }).notNull(), // e.g., "development", "staging", "production"
  deployedBy: text().references(() => user.id),
  status: varchar({ length: 50 }).notNull(), // e.g., "active", "inactive", "failed"
  deploymentMetadata: jsonb(),
  createdAt: timestamp().defaultNow(),
  updatedAt: timestamp().defaultNow(),
});

export const policyDeploymentRelations = relations(policyDeploymentsTable, ({ one }) => ({
  policy: one(policiesTable, {
    fields: [policyDeploymentsTable.policyId],
    references: [policiesTable.id],
  }),
  aiModel: one(aiModelsTable, {
    fields: [policyDeploymentsTable.aiModelId],
    references: [aiModelsTable.id],
  }),
  deployedByUser: one(user, {
    fields: [policyDeploymentsTable.deployedBy],
    references: [user.id],
  }),
}));

export const aiRequestsTable = pgTable("ai_requests", {
  id: uuid().primaryKey().defaultRandom(),
  aiModelId: uuid().references(() => aiModelsTable.id),
  requestTimestamp: timestamp().defaultNow(),
  requestContent: text().notNull(),
  responseContent: text(),
  processingTimeMs: integer(),
  metadata: jsonb(), // Additional request metadata
});

export const aiRequestRelations = relations(aiRequestsTable, ({ one, many }) => ({
  aiModel: one(aiModelsTable, {
    fields: [aiRequestsTable.aiModelId],
    references: [aiModelsTable.id],
  }),
  policyEvaluations: many(policyEvaluationsTable),
}));

export const policyEvaluationsTable = pgTable("policy_evaluations", {
  id: uuid().primaryKey().defaultRandom(),
  requestId: uuid().notNull().references(() => aiRequestsTable.id, { onDelete: "cascade" }),
  policyId: uuid().notNull().references(() => policiesTable.id),
  result: varchar({ length: 50 }).notNull(), // e.g., "pass", "modified", "blocked"
  evaluationTimeMs: integer(),
  originalContent: text(),
  modifiedContent: text(),
  violationDetails: jsonb(),
  evaluationTimestamp: timestamp().defaultNow(),
});

export const policyEvaluationRelations = relations(policyEvaluationsTable, ({ one }) => ({
  request: one(aiRequestsTable, {
    fields: [policyEvaluationsTable.requestId],
    references: [aiRequestsTable.id],
  }),
  policy: one(policiesTable, {
    fields: [policyEvaluationsTable.policyId],
    references: [policiesTable.id],
  }),
}));

export const auditLogsTable = pgTable("audit_logs", {
  id: serial().primaryKey(),
  userId: text().references(() => user.id),
  action: varchar({ length: 100 }).notNull(), // e.g., "policy_created", "policy_modified", "rule_added"
  resourceType: varchar({ length: 100 }).notNull(), // e.g., "policy", "rule", "deployment"
  resourceId: varchar({ length: 255 }).notNull(),
  details: jsonb(),
  ipAddress: varchar({ length: 50 }),
  userAgent: text(),
  timestamp: timestamp().defaultNow(),
});

export const auditLogRelations = relations(auditLogsTable, ({ one }) => ({
  user: one(user, {
    fields: [auditLogsTable.userId],
    references: [user.id],
  }),
  policy: one(policiesTable, {
    fields: [auditLogsTable.resourceId],
    references: [policiesTable.id],
    relationName: 'policyAuditLogs'
  }),
}));

export const integrationTypesTable = pgTable("integration_types", {
  id: serial().primaryKey(),
  name: varchar({ length: 100 }).notNull().unique(), // e.g., "LangChain", "LlamaIndex", "OpenAI"
  description: text(),
  configSchema: jsonb(), // JSON schema for the integration configuration
  createdAt: timestamp().defaultNow(),
  updatedAt: timestamp().defaultNow(),
});

export const integrationsTable = pgTable("integrations", {
  id: uuid().primaryKey().defaultRandom(),
  typeId: integer().notNull().references(() => integrationTypesTable.id),
  name: varchar({ length: 255 }).notNull(),
  configuration: jsonb().notNull(),
  isActive: boolean().default(true),
  createdById: text().references(() => user.id),
  createdAt: timestamp().defaultNow(),
  updatedAt: timestamp().defaultNow(),
});

export const integrationRelations = relations(integrationsTable, ({ one }) => ({
  type: one(integrationTypesTable, {
    fields: [integrationsTable.typeId],
    references: [integrationTypesTable.id],
  }),
  createdBy: one(user, {
    fields: [integrationsTable.createdById],
    references: [user.id],
  }),
}));

// Join table for policies and integrations (many-to-many)
export const policyIntegrationsTable = pgTable("policy_integrations", {
  policyId: uuid().notNull().references(() => policiesTable.id, { onDelete: "cascade" }),
  integrationId: uuid().notNull().references(() => integrationsTable.id, { onDelete: "cascade" }),
}, (t) => ({
  pk: primaryKey({ columns: [t.policyId, t.integrationId] }),
}));

export const policyIntegrationRelations = relations(policyIntegrationsTable, ({ one }) => ({
  policy: one(policiesTable, {
    fields: [policyIntegrationsTable.policyId],
    references: [policiesTable.id],
  }),
  integration: one(integrationsTable, {
    fields: [policyIntegrationsTable.integrationId],
    references: [integrationsTable.id],
  }),
}));

export const apikey = pgTable("apikey", {
  id: text("id").primaryKey(),
  name: text('name'),
  start: text('start'),
  prefix: text('prefix'),
  key: text('key').notNull(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  refillInterval: integer('refill_interval'),
  refillAmount: integer('refill_amount'),
  lastRefillAt: timestamp('last_refill_at'),
  enabled: boolean('enabled'),
  rateLimitEnabled: boolean('rate_limit_enabled'),
  rateLimitTimeWindow: integer('rate_limit_time_window'),
  rateLimitMax: integer('rate_limit_max'),
  requestCount: integer('request_count'),
  remaining: integer('remaining'),
  lastRequest: timestamp('last_request'),
  expiresAt: timestamp('expires_at'),
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at').notNull(),
  permissions: text('permissions'),
  metadata: text('metadata')
});
