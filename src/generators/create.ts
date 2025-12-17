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
  const TypeName = capitalize(name);

  /* -----------------------------
   * Module structure
   * ----------------------------- */
  const moduleDir = `src/modules/${modulePath}`;
  ensureDir(moduleDir, opts);

  // types.ts
  writeFileSafe(
    `${moduleDir}/types.ts`,
    `export type ${TypeName} = {
  id: string;
  name: string;
  description?: string;
  age?: number;
  gender?: "male" | "female";
};
`,
    opts
  );

  // values.ts
  writeFileSafe(
    `${moduleDir}/values.ts`,
    `import type { ${TypeName} } from "./types";

export const DATA: ${TypeName}[] = [
  {
    id: "1",
    name: "Sample ${TypeName}",
    description: "Dummy data",
    age: 20,
    gender: "male"
  }
];
`,
    opts
  );

  // services.ts
  writeFileSafe(
    `${moduleDir}/services.ts`,
    `import { DATA } from "./values";
import type { ${TypeName} } from "./types";

export function getAll(query?: { s?: string; gender?: string }) {
  let result = [...DATA];

  if (query?.s) {
    const q = query.s.toLowerCase();
    result = result.filter(d =>
      d.name.toLowerCase().includes(q)
    );
  }

  if (query?.gender) {
    result = result.filter(d =>
      d.gender === query.gender
    );
  }

  return result;
}

export function getById(id: string): ${TypeName} | null {
  return DATA.find(d => d.id === id) ?? null;
}

export function create(payload: ${TypeName}) {
  DATA.push(payload);
  return payload;
}

export function update(id: string, payload: Partial<${TypeName}>) {
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
   * Route file (ROOT LEVEL)
   * ----------------------------- */
  writeFileSafe(
    `src/routes/${routeFile}.ts`,
    `import { Elysia } from "elysia";
import * as services from "../modules/${modulePath}/services";
import { ok, fail } from "../shared/response";
import { badRequest, notFound } from "../shared/errors";

export const ${plural}Route = new Elysia({ prefix: "/${plural}" })

  .get("/", ({ query }) => {
    return ok(services.getAll(query));
  })

  .get("/:id", ({ params }) => {
    const data = services.getById(params.id);
    if (!data) {
      const err = notFound(
        "${name.toUpperCase()}_NOT_FOUND",
        "${TypeName} not found"
      );
      return new Response(
        JSON.stringify(fail(err.code, err.message)),
        { status: err.status }
      );
    }
    return ok(data);
  })

  .post("/", ({ body }) => {
    if (!body?.id || !body?.name) {
      const err = badRequest(
        "INVALID_${name.toUpperCase()}_PAYLOAD",
        "Invalid payload"
      );
      return new Response(
        JSON.stringify(fail(err.code, err.message)),
        { status: err.status }
      );
    }
    return ok(services.create(body));
  })

  .put("/:id", ({ params, body }) => {
    const updated = services.update(params.id, body);
    if (!updated) {
      const err = notFound(
        "${name.toUpperCase()}_NOT_FOUND",
        "${TypeName} not found"
      );
      return new Response(
        JSON.stringify(fail(err.code, err.message)),
        { status: err.status }
      );
    }
    return ok(updated);
  })

  .delete("/:id", ({ params }) => {
    const removed = services.remove(params.id);
    if (!removed) {
      const err = notFound(
        "${name.toUpperCase()}_NOT_FOUND",
        "${TypeName} not found"
      );
      return new Response(
        JSON.stringify(fail(err.code, err.message)),
        { status: err.status }
      );
    }
    return ok(true);
  });
`,
    opts
  );

  /* -----------------------------
   * spec.md
   * ----------------------------- */
  writeFileSafe(
    `${moduleDir}/spec.md`,
    `# ${TypeName} API

Base path: \`/${plural}\`

## GET /${plural}
Query:
- s (string)
- gender (male | female)

## GET /${plural}/:id
Errors:
- 404 ${name.toUpperCase()}_NOT_FOUND

## POST /${plural}
Errors:
- 400 INVALID_${name.toUpperCase()}_PAYLOAD

## PUT /${plural}/:id
Errors:
- 404 ${name.toUpperCase()}_NOT_FOUND

## DELETE /${plural}/:id
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
