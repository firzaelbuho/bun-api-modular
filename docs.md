Below is the **raw Markdown (plain `.md`)** for the **Architecture & Guideline document**.
This is **NOT usage docs**, but a **formal architectural specification** meant to be read by humans, reviewers, and AI.

You can save this directly as `ARCHITECTURE.md`.

---

# 🧱 bun-api-modular — Architecture Specification

**Strict Modular REST API Architecture for Bun + Elysia**

This document defines the **mandatory architecture** enforced by **bun-api-modular**.
It is not a suggestion. It is the **contract**.

If an implementation violates this document, **the architecture is broken**.

---

## 1. Architecture Goals

This architecture is designed to:

* Enforce strict separation of concerns
* Scale safely as the API grows
* Remain readable for years
* Be auditable without running the code
* Be deterministic for generators and AI
* Avoid “clever” or implicit behavior

It intentionally prioritizes **long-term maintainability** over short-term speed.

---

## 2. Core Principle

> **1 domain = 1 module = 1 route**

A *domain* is a business concept (e.g. student, product, order).
Each domain:

* Has exactly one module
* Has exactly one route group
* Owns its own logic, data, and contract

No domain may leak into another.

---

## 3. Global Project Structure

```text
src/
├── app.ts
├── server.ts
│
├── routes/
│   ├── index.ts
│   ├── root.ts
│   ├── students.ts
│   └── products.ts
│
├── modules/
│   ├── student/
│   │   ├── types.ts
│   │   ├── values.ts
│   │   ├── services.ts
│   │   └── spec.md
│   └── product/
│
└── shared/
    ├── response.ts
    └── errors.ts
```

This structure is **non-negotiable**.

---

## 4. Bootstrap Layer (FROZEN)

### `src/app.ts`

Purpose:

* Compose routes
* Know nothing about domains
* Never contain business logic

```ts
import { Elysia } from "elysia";
import { routes } from "./routes";

export const app = new Elysia();

routes.forEach((route) => {
  app.use(route);
});
```

Rules:

* Must never be modified after initialization
* Must not import modules
* Must not contain conditions or logic

---

### `src/server.ts`

Purpose:

* Start the HTTP server
* Nothing else

```ts
import { app } from "./app";

const PORT = process.env.PORT ?? 3000;

app.listen(PORT);
console.log("API running on port", PORT);
```

Rules:

* No domain awareness
* No configuration logic
* No side effects beyond starting the server

---

## 5. Routing System

### 5.1 Root Route

`src/routes/root.ts`

Purpose:

* Health check
* Sanity check
* Infrastructure-level endpoint

```ts
import { Elysia } from "elysia";

export const rootRoute = new Elysia()
  .get("/", () => ({
    success: true,
    message: "bun-api-modular running"
  }));
```

Rules:

* Not a domain
* May return simple JSON
* Must not depend on services or modules

---

### 5.2 Route Registry

`src/routes/index.ts`

Purpose:

* Single source of truth for all routes
* Explicit registration
* Deterministic order

```ts
import { rootRoute } from "./root";
import { studentsRoute } from "./students";

export const routes = [
  rootRoute,
  studentsRoute
];
```

Rules:

* No auto-discovery
* Generator controls this file
* No business logic

---

### 5.3 Domain Route Files

Example: `src/routes/students.ts`

Purpose:

* HTTP adapter only
* Map HTTP → service calls

```ts
import { Elysia } from "elysia";
import * as services from "../modules/student/services";
import { ok, fail } from "../shared/response";
import { notFound } from "../shared/errors";

export const studentsRoute = new Elysia({ prefix: "/students" })

  .get("/", ({ query }) => {
    return ok(services.getAll(query));
  })

  .get("/:id", ({ params }) => {
    const data = services.getById(params.id);
    if (!data) {
      const err = notFound(
        "STUDENT_NOT_FOUND",
        "Student not found"
      );
      return new Response(
        JSON.stringify(fail(err.code, err.message)),
        { status: err.status }
      );
    }
    return ok(data);
  });
```

Rules:

* Must not contain business logic
* Must not mutate data
* Must not access `values.ts`
* Must only:

  * Parse request
  * Call services
  * Map responses and errors

---

## 6. Module Architecture (Domain Layer)

Each domain module lives in:

```text
src/modules/<domain>/
```

### Required Files

```text
types.ts
values.ts
services.ts
spec.md
```

No more. No less.

---

### 6.1 `types.ts` — Domain Contract

Purpose:

* Define domain models
* Describe data shape

Rules:

* Types only
* No logic
* No side effects
* No cross-module imports

---

### 6.2 `values.ts` — Data Source

Purpose:

* In-memory data storage
* Replaceable by database later

Rules:

* Mutable
* Never accessed by routes
* Only accessed by `services.ts`

---

### 6.3 `services.ts` — Business Logic (CORE)

Purpose:

* Contain all business rules
* Own all mutations

Rules:

* All CRUD logic lives here
* All search/filter logic lives here
* Routes must never reimplement logic
* Services may call helpers, but not routes

This is the **brain** of the system.

---

### 6.4 `spec.md` — API Contract

Purpose:

* Define the external API behavior
* Act as a promise to consumers

Example:

```md
# Students API

Base path: `/students`

## GET /students
Query:
- s (string)
- gender (male | female)

## GET /students/:id
Errors:
- 404 STUDENT_NOT_FOUND
```

Rules:

* Mandatory
* Must match implementation
* Must list all errors explicitly

---

## 7. Shared Layer

### `src/shared/response.ts`

Purpose:

* Enforce consistent API responses

Rules:

* JSON structure is stable
* HTTP status is handled separately

---

### `src/shared/errors.ts`

Purpose:

* Centralize HTTP error definitions

Rules:

* No magic numbers in routes
* Error shape must be consistent

---

## 8. Naming Conventions

| Item           | Rule                |
| -------------- | ------------------- |
| Module folder  | singular            |
| Route path     | plural              |
| Route file     | plural              |
| Route variable | `<plural>Route`     |
| Service file   | `services.ts`       |
| Error code     | `DOMAIN_ERROR_CODE` |

Violating naming rules **breaks consistency**.

---

## 9. Mental Model

* Route = HTTP adapter
* Services = business brain
* Values = storage
* Types = domain contract
* Spec = external promise

If any layer leaks responsibilities, the architecture is invalid.

---

## 10. What This Architecture Intentionally Avoids

* Implicit routing
* Magic decorators
* Global state
* Tight coupling
* Hidden side effects
* Over-engineering

---

## 11. Architecture Invariants

These rules must **never** be broken:

1. Routes do not contain logic
2. Services do not know HTTP
3. Modules do not depend on each other
4. `app.ts` and `server.ts` are frozen
5. `spec.md` always matches reality

Breaking any of these means **the architecture has failed**.

---

## 12. Final Statement

This architecture is designed to:

* Be boring
* Be explicit
* Be predictable
* Scale without decay

If it feels restrictive, that is intentional.

---

**bun-api-modular Architecture**
*Strict modular REST. Discipline over convenience.*
