import fs from "fs";
import path from "path";
import { ensureDir, writeFileSafe } from "../utils/fs";
import { registerRoute } from "../utils/registry";
import { trackModule } from "../utils/tracking";



export function runInit(opts: {
  force?: boolean;
  dryRun?: boolean;
}) {
  const SRC = "src";

  /* -----------------------------
   * Base structure
   * ----------------------------- */
  ensureDir(`${SRC}/routes/api`, opts);
  ensureDir(`${SRC}/modules`, opts);
  ensureDir(`${SRC}/shared`, opts);

  /* -----------------------------
   * app.ts (FROZEN)
   * ----------------------------- */
  writeFileSafe(
    `${SRC}/app.ts`,
    `import { Elysia } from "elysia";
import { routes } from "./routes";

export const app = new Elysia();
routes.forEach((route) => app.use(route));
`,
    opts
  );

  /* -----------------------------
   * server.ts (FROZEN)
   * ----------------------------- */
  writeFileSafe(
    `${SRC}/server.ts`,
    `import { app } from "./app";

app.listen(3000);
console.log("🚀 API running at http://localhost:3000");
`,
    opts
  );

  /* -----------------------------
   * Route registries
   * ----------------------------- */
  writeFileSafe(
    `${SRC}/routes/index.ts`,
    `import { apiRoutes } from "./api";

export const routes = [
  ...apiRoutes
];
`,
    opts
  );

  writeFileSafe(
    `${SRC}/routes/api/index.ts`,
    `export const apiRoutes = [];
`,
    opts
  );

  /* -----------------------------
   * Shared helpers
   * ----------------------------- */
  writeFileSafe(
    `${SRC}/shared/response.ts`,
    `export type ApiSuccess<T> = {
  success: true;
  data: T;
};

export type ApiError = {
  success: false;
  error: {
    code: string;
    message: string;
  };
};

export function ok<T>(data: T): ApiSuccess<T> {
  return { success: true, data };
}

export function fail(code: string, message: string): ApiError {
  return { success: false, error: { code, message } };
}
`,
    opts
  );

  writeFileSafe(
    `${SRC}/shared/errors.ts`,
    `export function badRequest(code: string, message: string) {
  return { status: 400, code, message };
}

export function notFound(code: string, message: string) {
  return { status: 404, code, message };
}
`,
    opts
  );

  /* -----------------------------
   * Auto-create test module
   * ----------------------------- */
  registerRoute("tests", "testsRoute", opts);
  trackModule("test", "test", "/tests", "init", opts);
}
