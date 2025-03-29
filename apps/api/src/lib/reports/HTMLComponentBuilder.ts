/**
 * HTMLComponentBuilder - Utility class for generating HTML components
 * Provides methods for creating common HTML elements with styling
 */
export class HTMLComponentBuilder {
  private html: string[] = [];
  private styles: string[] = [];
  private defaultStyles = `
    body {
      font-family: system-ui, -apple-system, sans-serif;
      line-height: 1.5;
      margin: 0;
      padding: 2rem;
      color: #333;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 1rem 0;
    }
    th, td {
      padding: 0.5rem;
      border: 1px solid #e2e8f0;
      text-align: left;
    }
    th {
      background-color: #f8fafc;
    }
    h1, h2, h3, h4, h5, h6 {
      margin-top: 1.5rem;
      margin-bottom: 1rem;
    }
    section {
      margin: 2rem 0;
    }
    footer {
      margin-top: 4rem;
      padding-top: 2rem;
      border-top: 1px solid #e2e8f0;
      font-size: 0.875rem;
      color: #64748b;
    }
    .page-break {
      page-break-after: always;
    }
  `;

  constructor() {
    this.styles = [this.defaultStyles];
  }

  // Reset builder
  public reset (): HTMLComponentBuilder {
    this.html = [];
    this.styles = [this.defaultStyles];
    return this;
  }

  // Basic text
  public text (content: string): HTMLComponentBuilder {
    this.html.push(content);
    return this;
  }

  // Raw HTML
  public rawHtml (html: string): HTMLComponentBuilder {
    this.html.push(html);
    return this;
  }

  // Paragraph
  public paragraph (content: string, className?: string): HTMLComponentBuilder {
    const classAttr = className ? ` class="${className}"` : '';
    this.html.push(`<p${classAttr}>${content}</p>`);
    return this;
  }

  // Heading (h1-h6)
  public heading (content: string, level: number = 1, className?: string): HTMLComponentBuilder {
    const validLevel = Math.min(Math.max(level, 1), 6);
    const classAttr = className ? ` class="${className}"` : '';
    this.html.push(`<h${validLevel}${classAttr}>${content}</h${validLevel}>`);
    return this;
  }

  // Table
  public table (
    data: (string | number)[][],
    headers?: string[],
    className?: string
  ): HTMLComponentBuilder {
    const classAttr = className ? ` class="${className}"` : '';
    let tableHtml = `<table${classAttr}>`;

    // Add headers if provided
    if (headers && headers.length > 0) {
      tableHtml += '<thead><tr>';
      for (const header of headers) {
        tableHtml += `<th>${header}</th>`;
      }
      tableHtml += '</tr></thead>';
    }

    // Add data rows
    tableHtml += '<tbody>';
    for (const row of data) {
      tableHtml += '<tr>';
      for (const cell of row) {
        tableHtml += `<td>${cell}</td>`;
      }
      tableHtml += '</tr>';
    }
    tableHtml += '</tbody></table>';

    this.html.push(tableHtml);
    return this;
  }

  // List (ordered or unordered)
  public list (
    items: string[],
    ordered: boolean = false,
    className?: string
  ): HTMLComponentBuilder {
    const tag = ordered ? 'ol' : 'ul';
    const classAttr = className ? ` class="${className}"` : '';
    let listHtml = `<${tag}${classAttr}>`;

    for (const item of items) {
      listHtml += `<li>${item}</li>`;
    }

    listHtml += `</${tag}>`;
    this.html.push(listHtml);
    return this;
  }

  // Image
  public image (
    src: string,
    alt: string = '',
    width?: string,
    height?: string,
    className?: string
  ): HTMLComponentBuilder {
    const classAttr = className ? ` class="${className}"` : '';
    const widthAttr = width ? ` width="${width}"` : '';
    const heightAttr = height ? ` height="${height}"` : '';
    this.html.push(`<img src="${src}" alt="${alt}"${widthAttr}${heightAttr}${classAttr} />`);
    return this;
  }

  // Division (container)
  public div (content: string, className?: string): HTMLComponentBuilder {
    const classAttr = className ? ` class="${className}"` : '';
    this.html.push(`<div${classAttr}>${content}</div>`);
    return this;
  }

  // Section with title
  public section (title: string, content: string, className?: string): HTMLComponentBuilder {
    const classAttr = className ? ` class="${className}"` : '';
    this.html.push(`<section${classAttr}><h2>${title}</h2>${content}</section>`);
    return this;
  }

  // Horizontal rule
  public horizontalRule (): HTMLComponentBuilder {
    this.html.push('<hr />');
    return this;
  }

  // Page break (for PDF)
  public pageBreak (): HTMLComponentBuilder {
    this.html.push('<div class="page-break"></div>');
    return this;
  }

  // Add custom CSS
  public addStyle (css: string): HTMLComponentBuilder {
    this.styles.push(css);
    return this;
  }

  // Render the full HTML document
  public render (): string {
    const combinedStyles = this.styles.join('\n');

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Rizk Compliance Report</title>
  <style>
    ${combinedStyles}
  </style>
</head>
<body>
  ${this.html.join('\n')}
</body>
</html>`;
  }
} 