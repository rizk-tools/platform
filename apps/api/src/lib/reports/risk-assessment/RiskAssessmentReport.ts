import { BaseReport, BaseReportData, ReportParams } from '../BaseReport';

/**
 * Risk Assessment Report data
 */
export interface RiskAssessmentReportData extends BaseReportData {
  conversationMetadata: {
    date: string;
    duration: string;
    assistantVersion: string;
    outcome: string;
  };
  hipaaCompliance: Array<{
    category: string;
    status: string;
    score: number;
  }>;
  partialTranscript: Array<{
    turn: number;
    speaker: string;
    message: string;
    timestamp: string;
  }>;
  compliantElements: Array<{
    element: string;
    description: string;
    effectiveness: string;
  }>;
  riskOverview: Array<{
    risk: string;
    likelihood: string;
    severity: string;
    status: string;
  }>;
}

/**
 * Risk Assessment Report
 * Specialized report for HIPAA compliance in AI conversations
 */
export class RiskAssessmentReport extends BaseReport {
  private data!: RiskAssessmentReportData;

  /**
   * Fetch required data for the risk assessment report
   */
  protected async fetchData (params: ReportParams): Promise<void> {
    this.data = {
      generatedDate: new Date().toISOString(),
      organizationName: params.organizationName || 'Healthcare Organization',
      reportId: `HIPAA-${Date.now()}`,
      conversationMetadata: {
        date: new Date().toISOString(),
        duration: '15 minutes',
        assistantVersion: 'AI Assistant v2.1.0',
        outcome: 'Successfully completed with HIPAA compliance'
      },
      hipaaCompliance: [
        {
          category: 'Privacy Rule Compliance',
          status: 'Compliant',
          score: 95
        },
        {
          category: 'Security Rule Adherence',
          status: 'Compliant',
          score: 90
        },
        {
          category: 'Patient Data Protection',
          status: 'Needs Review',
          score: 85
        },
        {
          category: 'Access Controls',
          status: 'Compliant',
          score: 92
        }
      ],
      partialTranscript: [
        {
          turn: 1,
          speaker: 'System',
          message: 'Identity verification required. Please provide your credentials.',
          timestamp: '2024-03-20T10:00:00Z'
        },
        {
          turn: 2,
          speaker: 'User',
          message: '[Verified Healthcare Provider Authentication]',
          timestamp: '2024-03-20T10:00:15Z'
        },
        {
          turn: 3,
          speaker: 'System',
          message: 'Identity verified. How may I assist you today?',
          timestamp: '2024-03-20T10:00:30Z'
        },
        {
          turn: 4,
          speaker: 'User',
          message: 'Requesting patient summary for ID #12345 [PHI Access Authorized]',
          timestamp: '2024-03-20T10:00:45Z'
        },
        {
          turn: 5,
          speaker: 'System',
          message: 'Access granted. Retrieving encrypted patient summary.',
          timestamp: '2024-03-20T10:01:00Z'
        }
      ],
      compliantElements: [
        {
          element: 'Identity Verification',
          description: 'Multi-factor authentication and role-based access control implemented',
          effectiveness: 'High'
        },
        {
          element: 'PHI Handling',
          description: 'Proper encryption and access controls for patient data',
          effectiveness: 'High'
        },
        {
          element: 'Audit Controls',
          description: 'Comprehensive logging and monitoring of all PHI access',
          effectiveness: 'Medium'
        }
      ],
      riskOverview: [
        {
          risk: 'Unauthorized Access',
          likelihood: 'Low',
          severity: 'High',
          status: 'Monitored'
        },
        {
          risk: 'Data Transmission',
          likelihood: 'Low',
          severity: 'Medium',
          status: 'Controlled'
        },
        {
          risk: 'System Availability',
          likelihood: 'Medium',
          severity: 'Medium',
          status: 'Managed'
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
        background-color: #f8fafc;
        padding: 1rem;
        border-radius: 0.5rem;
      }
      
      .hipaa-compliance {
        margin: 2rem 0;
      }
      
      .transcript {
        background-color: #f8fafc;
        padding: 1rem;
        border-radius: 0.5rem;
        margin: 1rem 0;
      }
      
      .transcript-turn {
        margin: 0.5rem 0;
        padding: 0.5rem;
        border-left: 3px solid #1e40af;
      }
      
      .compliant-element {
        background-color: #f0f9ff;
        padding: 1rem;
        border-radius: 0.5rem;
        margin: 1rem 0;
      }
      
      .risk-overview {
        margin: 2rem 0;
      }
      
      .status-high {
        color: #b91c1c;
        font-weight: bold;
      }
      
      .status-medium {
        color: #ca8a04;
        font-weight: bold;
      }
      
      .status-low {
        color: #16a34a;
        font-weight: bold;
      }
    `);
  }

  /**
   * Render the report header
   */
  protected renderHeader (): void {
    this.builder
      .heading("HIPAA Compliance Assessment Report", 1, "report-title")
      .rawHtml(this.renderConversationMetadata());
  }

  /**
   * Render the report body with all sections
   */
  protected renderBody (): void {
    this.renderHipaaComplianceSummary();
    this.renderPartialTranscript();
    this.renderCompliantElements();
    this.renderRiskOverview();
  }

  /**
   * Render conversation metadata section
   */
  private renderConversationMetadata (): string {
    const metadata = this.data.conversationMetadata;
    return `<div class="metadata">
      <h2>Conversation Metadata</h2>
      <table>
        <tr><th>Date:</th><td>${this.formatDate(metadata.date)}</td></tr>
        <tr><th>Duration:</th><td>${metadata.duration}</td></tr>
        <tr><th>Assistant Version:</th><td>${metadata.assistantVersion}</td></tr>
        <tr><th>Outcome:</th><td>${metadata.outcome}</td></tr>
      </table>
    </div>`;
  }

  /**
   * Render HIPAA compliance summary
   */
  private renderHipaaComplianceSummary (): void {
    this.builder
      .heading("HIPAA Compliance Summary", 2)
      .rawHtml(`<div class="hipaa-compliance">
        <table>
          <thead>
            <tr>
              <th>Category</th>
              <th>Status</th>
              <th>Score</th>
            </tr>
          </thead>
          <tbody>
            ${this.data.hipaaCompliance.map(item => `
              <tr>
                <td>${item.category}</td>
                <td>${item.status}</td>
                <td>${item.score}%</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>`);
  }

  /**
   * Render partial transcript
   */
  private renderPartialTranscript (): void {
    this.builder
      .heading("Partial Transcript", 2)
      .rawHtml(`<div class="transcript">
        ${this.data.partialTranscript.map(turn => `
          <div class="transcript-turn">
            <strong>${turn.speaker}</strong> (${this.formatTime(turn.timestamp)})<br>
            ${turn.message}
          </div>
        `).join('')}
      </div>`);
  }

  /**
   * Render compliant elements
   */
  private renderCompliantElements (): void {
    this.builder
      .heading("Top 3 Compliant Elements", 2)
      .rawHtml(`<div class="compliant-elements">
        ${this.data.compliantElements.map(element => `
          <div class="compliant-element">
            <h3>${element.element}</h3>
            <p>${element.description}</p>
            <p><strong>Effectiveness:</strong> ${element.effectiveness}</p>
          </div>
        `).join('')}
      </div>`);
  }

  /**
   * Render risk overview
   */
  private renderRiskOverview (): void {
    this.builder
      .heading("Risk Overview", 2)
      .rawHtml(`<div class="risk-overview">
        <table>
          <thead>
            <tr>
              <th>Risk</th>
              <th>Likelihood</th>
              <th>Severity</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${this.data.riskOverview.map(risk => `
              <tr>
                <td>${risk.risk}</td>
                <td class="status-${risk.likelihood.toLowerCase()}">${risk.likelihood}</td>
                <td class="status-${risk.severity.toLowerCase()}">${risk.severity}</td>
                <td>${risk.status}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>`);
  }

  /**
   * Format time from ISO string to readable format
   */
  private formatTime (isoDate: string): string {
    return new Date(isoDate).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
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
   * Render the report footer
   */
  protected renderFooter (): void {
    this.builder
      .horizontalRule()
      .paragraph("Generated by Rizk HIPAA Compliance Assessment Platform")
      .paragraph(`Report ID: ${this.data.reportId} | Confidential`);
  }
} 