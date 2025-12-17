import fs from "fs";

type RegistryOptions = {
  dryRun?: boolean;
};

/**
 * Register route into src/routes/api/index.ts
 * - append-only
 * - deterministic
 * - no AST parsing (safe)
 */
export function registerRoute(
  routeFile: string,
  routeVar: string,
  opts: RegistryOptions
): void {
  const registryPath = "src/routes/api/index.ts";

  if (!fs.existsSync(registryPath)) {
    throw new Error("Route registry not found. Did you run init?");
  }

  let content = fs.readFileSync(registryPath, "utf8");

  if (content.includes(routeVar)) {
    // already registered → do nothing
    return;
  }

  const importLine = `import { ${routeVar} } from "./${routeFile}";\n`;

  // inject import at top
  content = importLine + content;

  // inject into apiRoutes array
  content = content.replace(
    /export const apiRoutes = \[/,
    `export const apiRoutes = [\n  ${routeVar},`
  );

  if (opts.dryRun) return;

  fs.writeFileSync(registryPath, content, "utf8");
}
