import { ensureDir, writeFileSafe } from "../utils/fs";
import { pluralize } from "../utils/pluralize";
import { registerRoute } from "../utils/registry";
import { trackModule } from "../utils/tracking";


export function runCreate(
  modulePath: string,
  opts: {
    route?: string;
    force?: boolean;
    dryRun?: boolean;
  }
) {
  const parts = modulePath.split("/");
  const name = parts.at(-1)!;
  const plural = opts.route ?? pluralize(name);
  const routeFile = plural.replace(/\//g, "-");

  /* -----------------------------
   * Module structure
   * ----------------------------- */
  const moduleDir = `src/modules/${modulePath}`;
  ensureDir(moduleDir, opts);

  writeFileSafe(
    `${moduleDir}/types.ts`,
    `export type ${capitalize(name)} = {
  id: string;
  name: string;
  description?: string;
  age?: number;
  gender?: "male" | "female";
};
`,
    opts
  );

  writeFileSafe(
    `${moduleDir}/values.ts`,
    `import type { ${capitalize(name)} } from "./types";

export const DATA: ${capitalize(name)}[] = [];
`,
    opts
  );

  writeFileSafe(
    `${moduleDir}/service.ts`,
    `import { DATA } from "./values";
import type { ${capitalize(name)} } from "./types";

export function getAll(query?: { s?: string; gender?: string }) {
  let data = [...DATA];

  if (query?.s) {
    const q = query.s.toLowerCase();
    data = data.filter(d => d.name.toLowerCase().includes(q));
  }

  if (query?.gender) {
    data = data.filter(d => d.gender === query.gender);
  }

  return data;
}

export function getById(id: string) {
  return DATA.find(d => d.id === id) ?? null;
}

export function create(payload: ${capitalize(name)}) {
  DATA.push(payload);
  return payload;
}

export function update(id: string, payload: Partial<${capitalize(name)}>) {
  const item = getById(id);
  if (!item) return null;
  Object.assign(item, payload);
  return item;
}

export function remove(id: string) {
  const idx = DATA.findIndex(d => d.id === id);
  if (idx === -1) return false;
  DATA.splice(idx, 1);
  return true;
}
`,
    opts
  );

  /* -----------------------------
   * Route file
   * ----------------------------- */
  writeFileSafe(
    `src/routes/api/${routeFile}.ts`,
    `import { Elysia } from "elysia";
import * as svc from "@/modules/${modulePath}/service";
import { ok, fail } from "@/shared/response";
import { badRequest, notFound } from "@/shared/errors";

export const ${plural}Route = new Elysia({ prefix: "/${plural}" })

  .get("/", ({ query }) => ok(svc.getAll(query)))

  .get("/:id", ({ params }) => {
    const data = svc.getById(params.id);
    if (!data) {
      const err = notFound("${name.toUpperCase()}_NOT_FOUND", "${capitalize(name)} not found");
      return new Response(JSON.stringify(fail(err.code, err.message)), { status: err.status });
    }
    return ok(data);
  });
`,
    opts
  );

  /* -----------------------------
   * Spec
   * ----------------------------- */
  writeFileSafe(
    `${moduleDir}/spec.md`,
    `# ${capitalize(plural)} API

Base path: \`/${plural}\`

## GET /${plural}
Query:
- s (search by name)
- gender

## GET /${plural}/:id
Errors:
- 404 ${name.toUpperCase()}_NOT_FOUND
`,
    opts
  );

  /* -----------------------------
   * Register & track
   * ----------------------------- */
  registerRoute(routeFile, `${plural}Route`, opts);
  trackModule(name, modulePath, `/${plural}`, "create", opts);
}

function capitalize(v: string) {
  return v.charAt(0).toUpperCase() + v.slice(1);
}
