import type { router } from "@rizk/api/routes";

import { hc } from "hono/client";

export const client = hc<router>("");
export type Client = typeof client;

export default (...args: Parameters<typeof hc>): Client => hc<router>(...args);