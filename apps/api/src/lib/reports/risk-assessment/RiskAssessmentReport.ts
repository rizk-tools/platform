import { BaseReport, BaseReportData, ReportParams } from '../BaseReport';

/**
 * Risk Assessment Report data
 */
export interface RiskAssessmentReportData extends BaseReportData {
  assessmentPeriod: string;
  riskMatrix: Array<{
    category: string;
    likelihood: string;
    impact: string;
    score: number;
    mitigationStatus: string;
  }>;
  highRiskAreas: Array<{
    name: string;
    description: string;
    recommendation: string;
  }>;
  complianceScore: string;
  industry: string;
  regulatoryFrameworks: string[];
  nextAssessmentDate: string;
  upgradeUrl: string;
}

/**
 * Risk Assessment Report
 * Specialized report for AI risk assessment and mitigation
 */
export class RiskAssessmentReport extends BaseReport {
  private data!: RiskAssessmentReportData;

  /**
   * Fetch required data for the risk assessment report
   */
  protected async fetchData (params: ReportParams): Promise<void> {
    // In a real implementation, this would query a database
    // For now, we'll use mock data

    this.data = {
      generatedDate: new Date().toISOString(),
      organizationName: params.organizationName || 'Acme Corp',
      reportId: `RISK-${Date.now()}`,
      assessmentPeriod: params.timeRange || 'Last 90 days',
      complianceScore: '78%',
      industry: 'Financial Services',
      regulatoryFrameworks: ['GDPR', 'EU AI Act', 'PCI DSS'],
      nextAssessmentDate: this.getNextQuarter(),
      upgradeUrl: "https://rizk.tools/upgrade",
      riskMatrix: [
        {
          category: 'Data Privacy',
          likelihood: 'Medium',
          impact: 'High',
          score: 7.5,
          mitigationStatus: 'In Progress'
        },
        {
          category: 'Model Governance',
          likelihood: 'Low',
          impact: 'Medium',
          score: 4.2,
          mitigationStatus: 'Compliant'
        },
        {
          category: 'Transparency',
          likelihood: 'Low',
          impact: 'Medium',
          score: 3.8,
          mitigationStatus: 'Compliant'
        },
        {
          category: 'Output Validation',
          likelihood: 'Medium',
          impact: 'High',
          score: 6.9,
          mitigationStatus: 'Needs Attention'
        },
        {
          category: 'Security Controls',
          likelihood: 'Medium',
          impact: 'Critical',
          score: 8.1,
          mitigationStatus: 'Needs Attention'
        }
      ],
      highRiskAreas: [
        {
          name: 'Security Controls',
          description: 'Current security measures around AI model access and operation do not meet industry standards.',
          recommendation: 'Implement multi-factor authentication and role-based access control for all AI systems.'
        },
        {
          name: 'Data Privacy',
          description: 'Potential exposure of sensitive data through AI responses and logs.',
          recommendation: 'Enhance data minimization practices and implement PII detection and redaction.'
        },
        {
          name: 'Output Validation',
          description: 'Insufficient validation of AI-generated content before delivery to end-users.',
          recommendation: 'Develop an automated content validation pipeline with human review for high-risk outputs.'
        }
      ]
    };
  }

  /**
   * Add custom styles for this report type
   */
  protected setupStyles (): void {
    this.builder.addStyle(`
      .report-title {
        color: #1e40af;
        text-align: center;
        margin-bottom: 2rem;
      }
      
      .metadata {
        margin: 2rem 0;
      }
      
      .risk-matrix {
        margin: 2rem 0;
      }
      
      .risk-score {
        font-weight: bold;
      }
      
      .risk-critical {
        background-color: #fee2e2;
        color: #b91c1c;
      }
      
      .risk-high {
        background-color: #fef3c7;
        color: #92400e;
      }
      
      .risk-medium {
        background-color: #e0f2fe;
        color: #0369a1;
      }
      
      .risk-low {
        background-color: #dcfce7;
        color: #166534;
      }
      
      .status-needs-attention {
        font-weight: bold;
        color: #b91c1c;
      }
      
      .status-in-progress {
        font-weight: bold;
        color: #ca8a04;
      }
      
      .status-compliant {
        font-weight: bold;
        color: #16a34a;
      }
      
      .high-risk-area {
        border-left: 4px solid #b91c1c;
        padding-left: 1rem;
        margin: 1.5rem 0;
      }
      
      .recommendation {
        background-color: #f0f9ff;
        padding: 1rem;
        border-radius: 0.5rem;
        margin-top: 0.5rem;
      }
      
      .upgrade-button {
        margin: 2rem 0;
        text-align: center;
      }
      
      .upgrade-button a {
        display: inline-block;
        background-color: #1e40af;
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
      .heading("AI Risk Assessment Report", 1, "report-title")
      .rawHtml(this.renderMetadataSection([
        { label: "Report Generated", value: this.formatDate(this.data.generatedDate) },
        { label: "Organization", value: this.data.organizationName },
        { label: "Assessment Period", value: this.data.assessmentPeriod },
        { label: "Industry", value: this.data.industry },
        { label: "Overall Compliance Score", value: this.data.complianceScore }
      ]));
  }

  /**
   * Render the report body with all sections
   */
  protected renderBody (): void {
    this.renderExecutiveSummary();
    this.renderRiskMatrix();
    this.renderHighRiskAreas();
    this.renderRegulatoryFrameworks();
    this.renderNextSteps();
    this.renderUpgradeSection();
  }

  /**
   * Render the executive summary section
   */
  private renderExecutiveSummary (): void {
    this.builder
      .heading("Executive Summary", 2)
      .paragraph(`This risk assessment report provides an overview of your organization's AI compliance status, focusing on key risk areas and recommended actions. Your current overall compliance score is ${this.data.complianceScore}, with several high-risk areas requiring immediate attention.`);
  }

  /**
   * Render the risk matrix section
   */
  private renderRiskMatrix (): void {
    this.builder
      .heading("Risk Matrix", 2)
      .paragraph("The following matrix identifies key risk areas based on likelihood and potential impact:")
      .rawHtml(this.renderRiskMatrixTable(this.data.riskMatrix));
  }

  /**
   * Render the high risk areas section
   */
  private renderHighRiskAreas (): void {
    this.builder
      .heading("High Risk Areas", 2)
      .paragraph("The following areas require immediate attention based on our assessment:")

    // Render each high risk area
    for (const area of this.data.highRiskAreas) {
      this.builder.rawHtml(this.renderHighRiskArea(area));
    }
  }

  /**
   * Render the regulatory frameworks section
   */
  private renderRegulatoryFrameworks (): void {
    this.builder
      .heading("Regulatory Alignment", 2)
      .paragraph("This assessment has been conducted against the following regulatory frameworks:")
      .list(this.data.regulatoryFrameworks)
      .paragraph("These frameworks form the baseline for compliance requirements in your industry and region.");
  }

  /**
   * Render the next steps section
   */
  private renderNextSteps (): void {
    this.builder
      .heading("Next Steps", 2)
      .paragraph("Based on this assessment, we recommend the following actions:")
      .list([
        "Address the high-risk areas identified in this report with priority",
        "Implement continuous monitoring for compliance violations",
        "Conduct employee training on AI risk management",
        "Schedule your next risk assessment for " + this.data.nextAssessmentDate,
      ])
      .paragraph("These actions will significantly improve your compliance posture and reduce potential risks.");
  }

  /**
   * Render the upgrade call-to-action
   */
  protected renderUpgradeSection (): void {
    this.builder
      .heading("Upgrade to Premium Risk Assessment", 2)
      .paragraph("Get access to:")
      .list([
        "Detailed risk mitigation strategies",
        "Automated compliance monitoring",
        "Weekly vulnerability scans",
        "Expert consultation and support"
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
      .paragraph("Generated by Rizk Risk Assessment Platform")
      .paragraph(`Report ID: ${this.data.reportId} | Confidential`)
      .paragraph(`Next scheduled assessment: ${this.data.nextAssessmentDate}`);
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
   * Generate a date string for the next quarterly assessment
   */
  private getNextQuarter (): string {
    const now = new Date();
    const nextQuarter = new Date(now);
    nextQuarter.setMonth(now.getMonth() + 3);

    return nextQuarter.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
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
   * Generate HTML for risk matrix table
   */
  private renderRiskMatrixTable (
    items: Array<{
      category: string;
      likelihood: string;
      impact: string;
      score: number;
      mitigationStatus: string;
    }>
  ): string {
    items.sort((a, b) => b.score - a.score);

    let html = `<div class="risk-matrix"><table>
      <thead>
        <tr>
          <th>Risk Category</th>
          <th>Likelihood</th>
          <th>Impact</th>
          <th>Risk Score</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>`;

    for (const item of items) {
      const riskClass = item.score >= 7 ? 'risk-high' :
        item.score >= 5 ? 'risk-medium' : 'risk-low';

      const statusClass = item.mitigationStatus === 'Needs Attention' ? 'status-needs-attention' :
        item.mitigationStatus === 'In Progress' ? 'status-in-progress' : 'status-compliant';

      html += `<tr>
        <td>${item.category}</td>
        <td>${item.likelihood}</td>
        <td>${item.impact}</td>
        <td class="risk-score ${riskClass}">${item.score.toFixed(1)}</td>
        <td class="${statusClass}">${item.mitigationStatus}</td>
      </tr>`;
    }

    html += '</tbody></table></div>';
    return html;
  }

  /**
   * Generate HTML for a high risk area
   */
  private renderHighRiskArea (
    area: {
      name: string;
      description: string;
      recommendation: string;
    }
  ): string {
    return `<div class="high-risk-area">
      <h3>${area.name}</h3>
      <p>${area.description}</p>
      <div class="recommendation">
        <strong>Recommendation:</strong> ${area.recommendation}
      </div>
    </div>`;
  }
} 