#!/usr/bin/env bun
import { Command } from "commander";
import pc from "picocolors";

import { runInit } from "./generators/init";
import { runCreate } from "./generators/create";

const program = new Command();

program
  .name("bun-api-modular")
  .description("Strict Modular REST API Generator (Bun + Elysia)")
  .version("1.0.0");

/* -----------------------------
 * init
 * ----------------------------- */
program
  .command("init")
  .description("Initialize API project (structure + shared + test module)")
  .option("--force", "Overwrite existing files")
  .option("--dry-run", "Preview generated files without writing")
  .action((opts) => {
    console.log(pc.cyan("→ Initializing project"));
    runInit(opts);
    console.log(pc.green("✔ Init completed"));
  });

/* -----------------------------
 * create module
 * ----------------------------- */
program
  .command("create")
  .argument("<modulePath>", "Module path (singular, supports nested)")
  .option("--route <path>", "Custom route path (plural)")
  .option("--force", "Overwrite existing module")
  .option("--dry-run", "Preview generated files without writing")
  .description("Create API module with full CRUD starter")
  .action((modulePath, opts) => {
    console.log(pc.cyan(`→ Creating module: ${modulePath}`));
    runCreate(modulePath, opts);
    console.log(pc.green("✔ Module created"));
  });

program.parse(process.argv);
