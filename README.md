

# 🧱 bun-api-modular

**Strict Modular REST API Generator for Bun + Elysia**

📦 **NPM:** `bun-api-modular`
🚀 **Runtime:** Bun
🧠 **Framework:** Elysia
📜 **License:** MIT

---

## 📌 Overview

`bun-api-modular` is a **CLI generator** for building **strict, clean, and scalable REST APIs** using **Bun + Elysia**.

This tool is **not a quick scaffold**.
It enforces architectural discipline from day one:

* 1 domain endpoint = 1 module
* Routes are **plural**, modules are **singular**
* No logic in routes
* All mutations live in services
* Consistent response & error contracts
* API spec (`spec.md`) is mandatory
* Routes are auto-registered
* Endpoints work immediately after generation

If you are looking for “fast but messy”, **this tool is not for you**.

---

## 📋 Table of Contents

- [🧱 bun-api-modular](#-bun-api-modular)
  - [📌 Overview](#-overview)
  - [📋 Table of Contents](#-table-of-contents)
  - [📦 Installation](#-installation)
    - [Using Bun (Recommended)](#using-bun-recommended)
  - [🚀 Quick Start](#-quick-start)
    - [1️⃣ Initialize Project](#1️⃣-initialize-project)
    - [2️⃣ Create a Module](#2️⃣-create-a-module)
    - [Nested Module](#nested-module)
    - [Custom Route](#custom-route)
  - [🛠 CLI Commands](#-cli-commands)
    - [`init`](#init)
    - [`create <module-path>`](#create-module-path)
  - [🧱 Project Structure](#-project-structure)
  - [🧩 Module Architecture](#-module-architecture)
    - [Rules](#rules)
  - [🔀 Routing \& Registry](#-routing--registry)
  - [📦 Response \& Error Contract](#-response--error-contract)
    - [Success Response](#success-response)
    - [Error Response](#error-response)
  - [📄 spec.md](#-specmd)
  - [🧠 Design Principles](#-design-principles)
  - [❌ What This Tool Intentionally Does NOT Do](#-what-this-tool-intentionally-does-not-do)
  - [📄 License](#-license)

---

## 📦 Installation

### Using Bun (Recommended)

```bash
# Run directly (no install required)
bunx bun-api-modular init

# Or install globally
bun add -g bun-api-modular
```

> `bunx` is Bun’s equivalent of `npx` and **uses caching**.

---

## 🚀 Quick Start

### 1️⃣ Initialize Project

```bash
bun-api-modular init
```

This will:

* Create the project structure
* Set up shared helpers
* Create route registries
* **Auto-generate an initial `test` module**
* Make the API immediately runnable

Start the server:

```bash
bun run src/server.ts
```

Test it:

```http
GET /tests
```

---

### 2️⃣ Create a Module

```bash
bun-api-modular create student
```

Immediately available:

```http
GET    /students
GET    /students/:id
POST   /students
PUT    /students/:id
DELETE /students/:id
```

No manual wiring required.

---

### Nested Module

```bash
bun-api-modular create shop/product
```

Auto-generated route:

```http
/shop/products
```

---

### Custom Route

```bash
bun-api-modular create user --route members
```

Route becomes:

```http
/members
```

---

## 🛠 CLI Commands

### `init`

```bash
bun-api-modular init
```

Purpose:

* Bootstrap the project
* Create `app.ts` and `server.ts`
* Create route registries
* Generate an initial `test` module

> `init` is intended to be run **once per project**.

---

### `create <module-path>`

```bash
bun-api-modular create <module-path>
```

Examples:

```bash
bun-api-modular create student
bun-api-modular create shop/product
```

Options:

| Flag             | Description                          |
| ---------------- | ------------------------------------ |
| `--route <path>` | Custom route (plural)                |
| `--force`        | Overwrite existing files             |
| `--dry-run`      | Preview output without writing files |

---

## 🧱 Project Structure

```text
src/
├── app.ts              # frozen (created by init)
├── server.ts           # frozen (created by init)
│
├── routes/
│   ├── index.ts        # root registry
│   └── api/
│       ├── index.ts    # API registry
│       ├── tests.ts
│       ├── students.ts
│       └── shop-products.ts
│
├── modules/
│   ├── test/
│   ├── student/
│   └── shop/
│       └── product/
│
└── shared/
    ├── response.ts
    └── errors.ts
```

---

## 🧩 Module Architecture

Each module **must** follow this structure:

```text
src/modules/student/
├── types.ts      # domain model
├── values.ts     # dummy in-memory data
├── service.ts    # all business logic & mutations
└── spec.md       # API contract
```

### Rules

* ❌ Modules must not import other modules
* ❌ Routes must not contain business logic
* ✅ All CRUD logic lives in `service.ts`
* ✅ Search & filter logic lives in `service.ts`

---

## 🔀 Routing & Registry

* All domain routes live in `src/routes/api`
* Routes are **auto-registered**
* `app.ts` is never modified after `init`

Flow:

```text
app.ts → routes/index.ts → routes/api/index.ts → route files
```

---

## 📦 Response & Error Contract

### Success Response

```json
{
  "success": true,
  "data": {}
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "STUDENT_NOT_FOUND",
    "message": "Student not found"
  }
}
```

Rules:

* HTTP status code is set via headers
* No status numbers inside JSON
* Error codes are **explicit and stable**

---

## 📄 spec.md

Each module automatically includes a `spec.md` file defining:

* Base path
* Endpoint list
* Query parameters
* Error matrix

Example:

```md
GET /students
GET /students/:id

Errors:
- STUDENT_NOT_FOUND
- INVALID_STUDENT_PAYLOAD
```

`spec.md` is a **contract**, not optional documentation.

---

## 🧠 Design Principles

`bun-api-modular` enforces:

1. **One module = one domain**
2. **Explicit registration**
3. **No magic discovery**
4. **Fail-fast behavior**
5. **Consistent API contracts**
6. **Spec-first mindset**

> This tool optimizes for **long-term maintainability**, not shortcuts.

---

## ❌ What This Tool Intentionally Does NOT Do

* ❌ Database integration
* ❌ Authentication / JWT
* ❌ ORM
* ❌ GraphQL
* ❌ Auto-magic routing

All of the above are **intentional exclusions**.

---

## 📄 License

MIT License © firzaelbuho

---

**bun-api-modular**
*Strict API architecture. No shortcuts.*
# bun-api-modular
