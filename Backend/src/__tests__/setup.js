import { beforeAll } from "vitest";

beforeAll(() => {
  process.env.ACCESS_TOKEN_SECRET = "test-access-secret-key-123";
  process.env.REFRESH_TOKEN_SECRET = "test-refresh-secret-key-456";
  process.env.ACCESS_TOKEN_EXPIRY = "1d";
  process.env.REFRESH_TOKEN_EXPIRY = "7d";
});
