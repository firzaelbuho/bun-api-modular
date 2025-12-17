
# 🧱 bun-api-modular

**Strict Modular REST API Generator for Bun + Elysia**

`bun-api-modular` is a **CLI generator** for building **clean, disciplined, and scalable REST APIs** using **Bun** and **Elysia**.

This tool is **not a quick scaffold**.
It **locks the architecture from day one** so your API stays maintainable as it grows.

---

## ✨ Core Philosophy

> **1 domain = 1 module = 1 route**

Principles enforced by this generator:

* No business logic in routes
* All logic lives in `services.ts`
* Modules are isolated by design
* Consistent structure for humans and AI
* No magic auto-discovery
* Explicit route registration
* APIs can be audited by structure + `spec.md`

If you want “fast but messy”, **do not use this tool**.

---

## 📦 Technology Stack

* **Runtime**: Bun
* **Framework**: Elysia
* **Language**: TypeScript
* **Architecture**: Flat modular REST (no `/api` prefix)

---

## 📥 Installation

### Run directly (recommended)

```
bunx bun-api-modular init
```

### Or install globally

```
bun add -g bun-api-modular
```

---

## 🚀 Quick Start

### 1️⃣ Initialize a Project

```
bun-api-modular init
```

What this does:

* Creates the base folder structure
* Generates `app.ts` and `server.ts` (FROZEN)
* Creates the route registry
* Creates the root `/` endpoint (health check)
* Sets up shared helpers (`response`, `errors`)
* **Does NOT create any domain modules**

Run the server:

```
bun run src/server.ts
```

Test:

```
GET http://localhost:3000/
```

Response:

```
{
  "success": true,
  "message": "bun-api-modular running"
}
```

---

### 2️⃣ Create a Domain Module

```
bun-api-modular create student
```

Endpoints become immediately available:

* `GET    /students`
* `GET    /students/:id`
* `POST   /students`
* `PUT    /students/:id`
* `DELETE /students/:id`

No manual wiring required.

---

## 🛠 CLI Commands

### `init`

```
bun-api-modular init
```

Purpose:

* Prepare the project foundation
* Generate infrastructure files
* Create no domains

This command should be run **once per project**.

---

### `create <module-path>`

```
bun-api-modular create <module-path>
```

Examples:

```
bun-api-modular create student
bun-api-modular create shop/product
```

Options:

* `--route` — Custom route name (plural)
* `--force` — Overwrite existing files
* `--dry-run` — Preview output without writing files

Custom route example:

```
bun-api-modular create user --route members
```

Resulting endpoint:

* `/members`

---

## 📁 Project Structure

```
src/
├── app.ts              # FROZEN – route composition
├── server.ts           # FROZEN – start server
│
├── routes/
│   ├── index.ts        # route registry
│   ├── root.ts         # GET /
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

---

## 🧩 Module Architecture

Each module **MUST** follow this structure:

```
src/modules/student/
├── types.ts
├── values.ts
├── services.ts
└── spec.md
```

### `types.ts`

Domain model definitions.

* Types and interfaces only
* No logic
* No cross-module imports

---

### `values.ts`

Dummy in-memory data source.

* Mutable
* Replaceable by a database later
* Never accessed directly by routes

---

### `services.ts`

**THE CORE LOGIC LAYER**.

* CRUD operations
* Search and filtering
* Domain validation
* All mutations

All business logic **MUST live here**.

---

### `spec.md`

The API contract.

* Base path
* Endpoint list
* Query parameters
* Error codes

`spec.md` is **mandatory** and must reflect the implementation.

---

## 🔀 Routing & Registry

* All domain routes live in `src/routes/`
* `routes/index.ts` is the **single source of truth**
* The generator manages route registration
* No auto-discovery or magic

Flow:

```
app.ts → routes/index.ts → route files → services
```

---

## 📦 Response & Error Contract

### Success Response

```
{
  "success": true,
  "data": {}
}
```

### Error Response

```
{
  "success": false,
  "error": {
    "code": "STUDENT_NOT_FOUND",
    "message": "Student not found"
  }
}
```

Rules:

* HTTP status codes are set via headers
* No status codes inside JSON
* Error codes are explicit and stable

---

## 🧠 Mental Model

Route = adapter
Services = brain
Values = storage
Types = contract
Spec = promise

If one layer leaks into another, **the architecture is broken**.

---

## ❌ What This Tool Intentionally Does NOT Do

`bun-api-modular` does **not**:

* Configure databases
* Handle authentication or JWT
* Provide ORMs
* Support GraphQL
* Handle deployment
* Manage `package.json`

These are **project-level decisions**, not generator concerns.

---

## 🎯 Who Is This Tool For?

Ideal for:

* Developers who value structure and discipline
* Long-lived backend projects
* Teams that need consistency
* AI-assisted development workflows
* APIs designed to scale cleanly over time

Not suitable for:

* One-off scripts
* Hackathon prototypes
* Experiments without structure

---

## 📄 License

MIT License © firzaelbuho

---

**bun-api-modular**
*Strict modular REST API. No shortcuts.*
