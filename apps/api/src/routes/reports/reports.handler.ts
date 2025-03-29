import * as HttpStatusCodes from "stoker/http-status-codes";
import { HtmlConverter, Chromiumly } from "chromiumly";
import type { AppRouteHandler } from "@/lib/types";
import { createReadStream } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

import type { GetRoute } from "./reports.routes";

export const get: AppRouteHandler<GetRoute> = async (c) => {
  Chromiumly.configure({
    endpoint: "https://gotenberg.lunanotes.io",
    username: process.env.GOTENBERG_USERNAME,
    password: process.env.GOTENBERG_PASSWORD,
  });

  const htmlConverter = new HtmlConverter();

  const path = join(__dirname, "templates", "eu-act.html");
  const htmlStream = createReadStream(path);

  const buffer = await htmlConverter.convert({
    html: htmlStream,
  });

  // Set response headers for PDF display
  c.header("Content-Type", "application/pdf");
  c.header("Content-Disposition", "inline; filename=report.pdf");
  c.header("Content-Length", buffer.length.toString());

  return c.body(buffer, HttpStatusCodes.OK);
};

