import { ensureDir, writeFileSafe } from "../utils/fs";

export function runInit(opts: {
  force?: boolean;
  dryRun?: boolean;
}) {
  const SRC = "src";

  /* -----------------------------
   * Base structure
   * ----------------------------- */
  ensureDir(`${SRC}/routes`, opts);
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

routes.forEach((route) => {
  app.use(route);
});
`,
    opts
  );

  /* -----------------------------
   * server.ts (FROZEN)
   * ----------------------------- */
  writeFileSafe(
    `${SRC}/server.ts`,
    `import { app } from "./app";

const PORT = process.env.PORT ?? 3000;

app.listen(PORT);
console.log("🚀 API running at http://localhost:" + PORT);
`,
    opts
  );

  /* -----------------------------
   * Route registry
   * ----------------------------- */
  writeFileSafe(
    `${SRC}/routes/index.ts`,
    `import { rootRoute } from "./root";

export const routes = [
  rootRoute
];
`,
    opts
  );

  /* -----------------------------
   * Root route (health check)
   * ----------------------------- */
  writeFileSafe(
    `${SRC}/routes/root.ts`,
    `import { Elysia } from "elysia";

export const rootRoute = new Elysia()
  .get("/", () => {
    return {
      success: true,
      message: "bun-api-modular running"
    };
  });
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
  return {
    success: false,
    error: { code, message }
  };
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
}
