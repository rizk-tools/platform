import { HTMLComponentBuilder } from './HTMLComponentBuilder';
import { HtmlConverter, Chromiumly } from 'chromiumly';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { writeFile } from 'node:fs/promises';
import { createReadStream } from 'node:fs';

/**
 * Base params for all reports
 */
export interface ReportParams {
  organizationId: string;
  organizationName: string;
  timeRange: string;
  [key: string]: any;
}

/**
 * Base report data interface
 */
export interface BaseReportData {
  generatedDate: string;
  organizationName: string;
  reportId: string;
}

/**
 * Abstract base class for all report types
 * Implements template method pattern for report generation
 */
export abstract class BaseReport {
  protected builder: HTMLComponentBuilder;

  constructor() {
    this.builder = new HTMLComponentBuilder();

    // Configure Chromiumly if not already configured
    this.configureChromiumly();
  }

  /**
   * Main template method for report generation
   * Orchestrates the report generation process
   */
  public async generateReport (params: ReportParams): Promise<Buffer> {
    try {
      // 1. Fetch data from database
      await this.fetchData(params);

      // 2. Generate HTML structure
      this.setupStyles();
      this.renderHeader();
      this.renderBody();
      this.renderFooter();

      // 3. Convert HTML to PDF
      console.log('[Report] Starting PDF conversion');
      const result = await this.convertToPDF();
      return result;
    } catch (error: any) {
      console.error('[Report] Error generating report:', error);
      throw new Error(`Failed to generate report: ${error.message}`);
    }
  }

  /**
   * Configure Chromiumly for PDF generation
   */
  private configureChromiumly (): void {
    // Only configure if environment variables are set
    if (
      process.env.GOTENBERG_URL &&
      process.env.GOTENBERG_USERNAME &&
      process.env.GOTENBERG_PASSWORD
    ) {
      Chromiumly.configure({
        endpoint: process.env.GOTENBERG_URL,
        username: process.env.GOTENBERG_USERNAME,
        password: process.env.GOTENBERG_PASSWORD,
      });
    }
  }

  /**
   * Convert HTML to PDF using Chromiumly/Gotenberg
   */
  protected async convertToPDF (): Promise<Buffer> {
    try {
      const html = this.builder.render();

      // Create temporary HTML file
      const tempPath = join(tmpdir(), `report-${Date.now()}.html`);
      await writeFile(tempPath, html);

      const htmlStream = createReadStream(tempPath);
      console.log('[PDF] Using file stream from:', tempPath);

      // Convert to PDF
      const htmlConverter = new HtmlConverter();

      // Check if the chromiumly package expects a different type of stream
      try {
        const result = await htmlConverter.convert({
          html: htmlStream,
        });
        return result;
      } catch (conversionError: unknown) {
        // If the first attempt fails, try an alternative approach
        console.error('[PDF] Stream conversion failed, trying direct HTML approach');

        // Try passing the HTML content directly if stream approach fails
        const result = await htmlConverter.convert({
          html,
        });
        return result;
      }
    } catch (error: unknown) {
      console.error('[PDF] Error in conversion:', error instanceof Error ? error.message : String(error));
      throw new Error(`Failed to generate report: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Abstract methods to be implemented by subclasses
   */
  protected abstract fetchData (params: ReportParams): Promise<void>;
  protected abstract setupStyles (): void;
  protected abstract renderHeader (): void;
  protected abstract renderBody (): void;
  protected abstract renderFooter (): void;
} 