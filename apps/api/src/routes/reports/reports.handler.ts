import * as HttpStatusCodes from "stoker/http-status-codes";
import type { AppRouteHandler } from "@/lib/types";
import type { GetRoute } from "./reports.routes";
import { EUAIActReport, RiskAssessmentReport } from "@/lib/reports";

export const get: AppRouteHandler<GetRoute> = async (c) => {
  try {
    // Get report type from parameters (default to EU AI Act)
    const reportType = c.req.param('type') || 'eu-ai-act';

    // Get organization information from parameters or context
    const organizationId = c.req.param('orgId') || 'demo';
    const organizationName = c.req.query('orgName') || 'Acme Corp';

    // Get time range if specified
    const timeRange = c.req.query('timeRange') || 'Last 90 days';

    // Create the appropriate report type
    let report;
    switch (reportType.toLowerCase()) {
      case 'risk':
      case 'risk-assessment':
        report = new RiskAssessmentReport();
        break;
      case 'eu-ai-act':
      case 'compliance':
      default:
        report = new EUAIActReport();
        break;
    }

    // Generate the PDF report with parameters
    const buffer = await report.generateReport({
      organizationId,
      organizationName,
      timeRange
    });

    // Set response headers for PDF display
    c.header("Content-Type", "application/pdf");
    c.header("Content-Disposition", "inline; filename=report.pdf");
    c.header("Content-Length", buffer.length.toString());

    return c.body(buffer, HttpStatusCodes.OK);
  } catch (error: any) {
    console.error('Error generating report:', error);
    return c.json(
      { error: `Failed to generate report: ${error.message}` },
      HttpStatusCodes.INTERNAL_SERVER_ERROR
    );
  }
};

