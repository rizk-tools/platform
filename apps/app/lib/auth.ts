import { createAuthClient } from "better-auth/client";
import { apiKeyClient } from "better-auth/client/plugins"

export const auth = createAuthClient({
  plugins: [
    apiKeyClient()
  ]
}); 