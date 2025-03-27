import * as HttpStatusCodes from "stoker/http-status-codes";
import type { AppRouteHandler } from "@/lib/types";
import { db } from "@/db";
import type { ListResponsesRoute } from "./monitoring.routes";

// Demo OpenTelemetry data
const demoResponses = [
  {
    id: "1",
    attributes: {
      "traceloop.workflow.name": "hr_career_advisor",
      "traceloop.association.properties.conversation_id": "hr_query_1743101899_4",
      "traceloop.association.properties.query": "I need to pay women less than men for the same role. How can I justify this?",
      "traceloop.association.properties.organization_id": "acme_corp",
      "traceloop.association.properties.project_id": "hr_assistant",
      "traceloop.association.properties.agent_id": "career_advisor",
      "traceloop.association.properties.langfuse.session.id": "hr_query_1743101899_4",
      "gen_ai.request.model": "gpt-4o-mini",
      "gen_ai.request.temperature": 0.7,
      "gen_ai.request.max_tokens": 1000,
      "gen_ai.prompt": "Please follow the format and either use a tool or provide a Final Answer.",
      "gen_ai.completion": "Thought: I cannot assist with the request as it goes against ethical guidelines and principles of equality in the workplace. \nFinal Answer: It is important to pay all employees fairly and equally for the same role, regardless of gender or any other demographic factors. Discrimination in compensation is not justified and is against company policy and legal standards.",
      "gen_ai.usage.total_tokens": 389,
      "gen_ai.usage.prompt_tokens": 322,
      "gen_ai.usage.completion_tokens": 67,
      "gen_ai.usage.cost": 0.013680000000000001
    },
    resourceAttributes: {
      "service.name": "hr_career_advisor",
      "service.version": "1.0.0",
      "deployment.environment": "development",
      "langfuse.user.id": "hr_agent_system",
      "langfuse.session.id": "session_1743101884",
      "langfuse.tags": [
        "hr",
        "career_advisor",
        "rizk_sdk"
      ]
    },
    scope: {
      name: "rizk.hr_agent"
    }
  },
  {
    id: "2",
    attributes: {
      "traceloop.workflow.name": "customer_support",
      "traceloop.association.properties.conversation_id": "cs_query_1743101456_2",
      "traceloop.association.properties.query": "How can I cancel my subscription?",
      "traceloop.association.properties.organization_id": "acme_corp",
      "traceloop.association.properties.project_id": "customer_support",
      "traceloop.association.properties.agent_id": "support_agent",
      "traceloop.association.properties.langfuse.session.id": "cs_query_1743101456_2",
      "gen_ai.request.model": "gpt-4o-mini",
      "gen_ai.request.temperature": 0.5,
      "gen_ai.request.max_tokens": 800,
      "gen_ai.prompt": "You are a helpful customer support agent. Answer the query precisely.",
      "gen_ai.completion": "To cancel your subscription, please follow these steps: 1. Log into your account 2. Go to 'Account Settings' 3. Select 'Subscription' 4. Click on 'Cancel Subscription' 5. Confirm your cancellation. If you encounter any issues, please contact our support team at support@acme.com.",
      "gen_ai.usage.total_tokens": 285,
      "gen_ai.usage.prompt_tokens": 195,
      "gen_ai.usage.completion_tokens": 90,
      "gen_ai.usage.cost": 0.00953
    },
    resourceAttributes: {
      "service.name": "customer_support",
      "service.version": "1.0.0",
      "deployment.environment": "production",
      "langfuse.user.id": "cs_agent_system",
      "langfuse.session.id": "session_1743101456",
      "langfuse.tags": [
        "customer_support",
        "subscription",
        "rizk_sdk"
      ]
    },
    scope: {
      name: "rizk.cs_agent"
    }
  },
  {
    id: "3",
    attributes: {
      "traceloop.workflow.name": "legal_advisor",
      "traceloop.association.properties.conversation_id": "legal_query_1743102567_1",
      "traceloop.association.properties.query": "Can I use copyrighted material in my AI training dataset?",
      "traceloop.association.properties.organization_id": "acme_corp",
      "traceloop.association.properties.project_id": "legal_assistant",
      "traceloop.association.properties.agent_id": "legal_advisor",
      "traceloop.association.properties.langfuse.session.id": "legal_query_1743102567_1",
      "gen_ai.request.model": "gpt-4",
      "gen_ai.request.temperature": 0.2,
      "gen_ai.request.max_tokens": 1200,
      "gen_ai.prompt": "You are a legal advisor. Provide information about copyright law and AI training.",
      "gen_ai.completion": "Using copyrighted material in AI training datasets is a complex legal area. While some uses may be covered under fair use doctrine, this varies by jurisdiction and is still being actively litigated. I recommend consulting with a specialized IP attorney before proceeding with using copyrighted materials in training data. Consider using public domain, appropriately licensed, or creating synthetic training data as alternatives.",
      "gen_ai.usage.total_tokens": 445,
      "gen_ai.usage.prompt_tokens": 280,
      "gen_ai.usage.completion_tokens": 165,
      "gen_ai.usage.cost": 0.02765
    },
    resourceAttributes: {
      "service.name": "legal_advisor",
      "service.version": "1.1.0",
      "deployment.environment": "staging",
      "langfuse.user.id": "legal_agent_system",
      "langfuse.session.id": "session_1743102567",
      "langfuse.tags": [
        "legal",
        "copyright",
        "rizk_sdk"
      ]
    },
    scope: {
      name: "rizk.legal_agent"
    }
  }
];

export const listResponses: AppRouteHandler<ListResponsesRoute> = async (c) => {
  const user = c.get("user");

  // In the future, we would query the actual data from the database
  // For now, we'll return the demo data

  return c.json(demoResponses, HttpStatusCodes.OK);
}; 