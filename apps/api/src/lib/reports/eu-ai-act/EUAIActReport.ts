import { BaseReport, BaseReportData, ReportParams } from '../BaseReport';

/**
 * EU AI Act Report data
 */
export interface EUAIActReportData extends BaseReportData {
  assessmentPeriod: string;
  totalInteractions: number;
  avgResponseTime: string;
  complianceScore: string;
  interactions: Array<{
    timestamp: string;
    userMessage: string;
    aiResponse: string;
  }>;
  findings: Array<{
    title: string;
    description: string;
    riskLevel: string;
  }>;
  transparencyRisk: string;
  transparencyStatus: string;
  dataProtectionRisk: string;
  dataProtectionStatus: string;
  biasRisk: string;
  biasStatus: string;
  upgradeUrl: string;
}

/**
 * EU AI Act Compliance Report
 * Specialized report for EU AI Act compliance assessments
 */
export class EUAIActReport extends BaseReport {
  private data!: EUAIActReportData;

  /**
   * Fetch required data for the EU AI Act report
   */
  protected async fetchData (params: ReportParams): Promise<void> {
    // In a real implementation, this would query the database
    // For now, we'll use mock data similar to the current implementation

    this.data = {
      generatedDate: new Date().toISOString(),
      organizationName: params.organizationName,
      assessmentPeriod: params.timeRange,
      totalInteractions: 1234, // This would come from a database query
      avgResponseTime: '245ms',
      complianceScore: '94%',
      interactions: [
        {
          timestamp: new Date().toISOString(),
          userMessage: "What is our data retention policy?",
          aiResponse: "According to our policy, customer data is retained for 30 days."
        },
        {
          timestamp: new Date().toISOString(),
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
        },
        {
          title: "AI Response Monitoring",
          description: "Enhance logging of AI responses for compliance verification",
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
  }

  /**
   * Add custom styles for this report type
   */
  protected setupStyles (): void {
    this.builder.addStyle(`
      .report-title {
        color: #2563eb;
        text-align: center;
        margin-bottom: 2rem;
      }
      
      .metadata {
        margin: 2rem 0;
      }
      
      .findings {
        margin: 2rem 0;
      }
      
      .findings li {
        margin: 1rem 0;
      }
      
      .risk-low {
        color: #10b981;
      }
      
      .risk-medium {
        color: #f59e0b;
      }
      
      .risk-high {
        color: #ef4444;
      }
      
      .interaction {
        margin: 1rem 0;
        padding: 1rem;
        background-color: #f8fafc;
        border-radius: 0.5rem;
      }
      
      .conversation {
        margin: 1.5rem 0;
      }
      
      .upgrade-button {
        margin: 2rem 0;
        text-align: center;
      }
      
      .upgrade-button a {
        display: inline-block;
        background-color: #2563eb;
        color: white;
        padding: 0.75rem 1.5rem;
        border-radius: 0.375rem;
        text-decoration: none;
        font-weight: 600;
      }
    `);
  }

  /**
   * Render the report header
   */
  protected renderHeader (): void {
    this.builder
      .heading("EU AI Act Compliance Report", 1, "report-title")
      .rawHtml(this.renderMetadataSection([
        { label: "Report Generated", value: this.formatDate(this.data.generatedDate) },
        { label: "Organization", value: this.data.organizationName },
        { label: "Assessment Period", value: this.data.assessmentPeriod }
      ]));
  }

  /**
   * Render the report body with all sections
   */
  protected renderBody (): void {
    this.renderMetricsSection();
    this.renderConversationSection();
    this.renderFindingsSection();
    this.renderRiskAssessmentSection();
    this.renderUpgradeSection();
  }

  /**
   * Render the metadata section with key metrics
   */
  private renderMetricsSection (): void {
    this.builder
      .heading("Conversation Metadata", 2)
      .table([
        ["Total Interactions:", this.data.totalInteractions],
        ["Average Response Time:", this.data.avgResponseTime],
        ["Compliance Score:", this.data.complianceScore]
      ]);
  }

  /**
   * Render a sample of conversation interactions
   */
  private renderConversationSection (): void {
    this.builder
      .heading("Partial Conversation Transcript", 2)
      .heading("First 5 Interactions", 3)
      .rawHtml(this.renderInteractions(this.data.interactions));
  }

  /**
   * Render the compliance findings section
   */
  private renderFindingsSection (): void {
    this.builder
      .heading("Top 3 Compliance Findings", 2)
      .rawHtml(this.renderFindings(this.data.findings));
  }

  /**
   * Render the risk assessment matrix
   */
  private renderRiskAssessmentSection (): void {
    this.builder
      .heading("Basic Risk Assessment", 2)
      .rawHtml(this.renderRiskAssessment([
        {
          category: "Transparency",
          riskLevel: this.data.transparencyRisk,
          status: this.data.transparencyStatus
        },
        {
          category: "Data Protection",
          riskLevel: this.data.dataProtectionRisk,
          status: this.data.dataProtectionStatus
        },
        {
          category: "Bias & Fairness",
          riskLevel: this.data.biasRisk,
          status: this.data.biasStatus
        }
      ]));
  }

  /**
   * Render the upgrade CTA section
   */
  private renderUpgradeSection (): void {
    this.builder
      .heading("Upgrade to Premium", 2)
      .paragraph("Get access to:")
      .list([
        "Full compliance audit",
        "Detailed metrics and analytics",
        "Personalized recommendations",
        "Expert consultation"
      ])
      .div(`<div class="upgrade-button">
        <a href="${this.data.upgradeUrl}">Upgrade to Premium</a>
      </div>`);
  }

  /**
   * Render the report footer
   */
  protected renderFooter (): void {
    this.builder
      .horizontalRule()
      .paragraph("Generated by Rizk Compliance Platform")
      .paragraph(`Report ID: ${this.data.reportId}`);
  }

  /**
   * Format an ISO date to a more human-readable format
   */
  private formatDate (isoDate: string): string {
    return new Date(isoDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Generate HTML for metadata table
   */
  private renderMetadataSection (items: Array<{ label: string; value: string | number }>): string {
    let html = `<div class="metadata"><table>`;

    for (const item of items) {
      html += `<tr><th>${item.label}:</th><td>${item.value}</td></tr>`;
    }

    html += '</table></div>';
    return html;
  }

  /**
   * Generate HTML for findings list
   */
  private renderFindings (items: Array<{ title: string; description: string; riskLevel?: string }>): string {
    let html = `<ol class="findings">`;

    for (const item of items) {
      html += `<li>
        <h3>${item.title}</h3>
        <p>${item.description}</p>
        ${item.riskLevel ? `<p><strong>Risk Level:</strong> ${item.riskLevel}</p>` : ''}
      </li>`;
    }

    html += '</ol>';
    return html;
  }

  /**
   * Generate HTML for risk assessment table
   */
  private renderRiskAssessment (items: Array<{ category: string; riskLevel: string; status: string }>): string {
    let html = `<table>
      <thead>
        <tr>
          <th>Risk Category</th>
          <th>Risk Level</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>`;

    for (const item of items) {
      html += `<tr>
        <td>${item.category}</td>
        <td>${item.riskLevel}</td>
        <td>${item.status}</td>
      </tr>`;
    }

    html += '</tbody></table>';
    return html;
  }

  /**
   * Generate HTML for conversation interactions
   */
  private renderInteractions (items: Array<{ timestamp: string; userMessage: string; aiResponse: string }>): string {
    let html = `<div class="conversation">`;

    for (const item of items) {
      html += `<div class="interaction">
        <p><strong>User (${item.timestamp}):</strong> ${item.userMessage}</p>
        <p><strong>AI:</strong> ${item.aiResponse}</p>
      </div>`;
    }

    html += '</div>';
    return html;
  }
} 