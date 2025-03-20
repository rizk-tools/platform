import type { Router } from "@rizk/api/routes";
import { hc } from "hono/client";

export const client = hc<Router>("");
export type Client = typeof client;

export default function (): Client {

  return client;
};
