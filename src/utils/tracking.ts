import fs from "fs";

type TrackSource = "init" | "create";

type ModuleEntry = {
  name: string;
  modulePath: string;
  route: string;
  createdBy: TrackSource;
};

/**
 * Track module creation
 * - append log
 * - update state json
 */
export function trackModule(
  name: string,
  modulePath: string,
  route: string,
  createdBy: TrackSource,
  opts: { dryRun?: boolean }
): void {
  const timestamp = new Date().toISOString();

  /* -------------------------
   * modules.log (append-only)
   * ------------------------- */
  const logLine = `[${timestamp}] ${createdBy} -> module: ${name} | route: ${route}\n`;

  if (!opts.dryRun) {
    fs.appendFileSync("modules.log", logLine);
  }

  /* -------------------------
   * modules.json (state)
   * ------------------------- */
  let json: { modules: ModuleEntry[] } = { modules: [] };

  if (fs.existsSync("modules.json")) {
    try {
      json = JSON.parse(fs.readFileSync("modules.json", "utf8"));
    } catch {
      throw new Error("Invalid modules.json. Cannot continue.");
    }
  }

  const exists = json.modules.some(
    (m) => m.modulePath === modulePath
  );

  if (exists) {
    return; // already tracked
  }

  json.modules.push({
    name,
    modulePath,
    route,
    createdBy
  });

  if (!opts.dryRun) {
    fs.writeFileSync(
      "modules.json",
      JSON.stringify(json, null, 2),
      "utf8"
    );
  }
}
