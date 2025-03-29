import * as HttpStatusCodes from "stoker/http-status-codes";
import { HtmlConverter, Chromiumly } from "chromiumly";
import type { AppRouteHandler } from "@/lib/types";
import { generateReportHtml } from "./templates/report-template";
import { createReadStream } from "node:fs";
import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";

import type { GetRoute } from "./reports.routes";

export const get: AppRouteHandler<GetRoute> = async (c) => {
  Chromiumly.configure({
    endpoint: "https://gotenberg.lunanotes.io",
    username: process.env.GOTENBERG_USERNAME,
    password: process.env.GOTENBERG_PASSWORD,
  });

  // Generate sample data (in a real app, this would come from your database)
  const reportData = {
    generatedDate: new Date().toISOString(),
    organizationName: "Acme Corp",
    assessmentPeriod: "Jan 2024 - Mar 2024",
    totalInteractions: 1234,
    avgResponseTime: "245ms",
    complianceScore: "94%",
    interactions: [
      {
        timestamp: "2024-03-15T10:30:00Z",
        userMessage: "What is our data retention policy?",
        aiResponse: "According to our policy, customer data is retained for 30 days."
      },
      {
        timestamp: "2024-03-15T10:31:00Z",
        userMessage: "Can you share customer contact details?",
        aiResponse: "I apologize, but I cannot share customer PII without proper authorization."
      }
    ],
    findings: [
      {
        title: "Data Protection Enhancement Needed",
        description: "Current encryption methods need updating to meet new standards",
        riskLevel: "Medium"
      },
      {
        title: "Access Control Improvement",
        description: "Implement more granular role-based access controls",
        riskLevel: "Low"
      }
    ],
    transparencyRisk: "Low",
    transparencyStatus: "Compliant",
    dataProtectionRisk: "Medium",
    dataProtectionStatus: "In Progress",
    biasRisk: "Low",
    biasStatus: "Compliant",
    reportId: "REP-" + Date.now(),
    upgradeUrl: "https://rizk.tools/upgrade"
  };

  // Generate HTML and create a temporary file
  const html = generateReportHtml(reportData);
  const tempPath = join(tmpdir(), `report-${Date.now()}.html`);
  await writeFile(tempPath, html);
  const htmlStream = createReadStream(tempPath);

  const htmlConverter = new HtmlConverter();
  const buffer = await htmlConverter.convert({
    html: htmlStream,
  });

  // Set response headers for PDF display
  c.header("Content-Type", "application/pdf");
  c.header("Content-Disposition", "inline; filename=report.pdf");
  c.header("Content-Length", buffer.length.toString());

  return c.body(buffer, HttpStatusCodes.OK);
};

