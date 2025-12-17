import fs from "fs";

type RegistryOptions = {
  dryRun?: boolean;
};

/**
 * Register route into src/routes/index.ts
 * - append-only
 * - deterministic
 * - no AST parsing
 * - flat routes (no /api)
 */
export function registerRoute(
  routeFile: string,
  routeVar: string,
  opts: RegistryOptions
): void {
  const registryPath = "src/routes/index.ts";

  if (!fs.existsSync(registryPath)) {
    throw new Error(
      "Route registry not found. Did you run init?"
    );
  }

  let content = fs.readFileSync(registryPath, "utf8");

  // already registered → do nothing
  if (content.includes(routeVar)) {
    return;
  }

  const importLine = `import { ${routeVar} } from "./${routeFile}";\n`;

  /**
   * 1. Inject import AFTER rootRoute import
   *    (to keep deterministic order)
   */
  if (!content.includes(importLine)) {
    content = content.replace(
      /import\s+\{\s*rootRoute\s*\}\s+from\s+"\.\/root";\n/,
      (m) => m + importLine
    );
  }

  /**
   * 2. Inject into routes array
   */
  const routesArrayRegex =
    /export const routes = \[\s*([\s\S]*?)\s*\];/;

  const match = content.match(routesArrayRegex);

  if (!match) {
    throw new Error("Invalid routes registry format.");
  }

  const body = match[1];

  if (!body.includes(routeVar)) {
    const newBody = body.trim()
      ? `${body.trim()},\n  ${routeVar}`
      : `${routeVar}`;

    content = content.replace(
      routesArrayRegex,
      `export const routes = [\n  ${newBody}\n];`
    );
  }

  if (opts.dryRun) return;

  fs.writeFileSync(registryPath, content, "utf8");
}
