import fs from "fs";
import path from "path";

type FsOptions = {
  force?: boolean;
  dryRun?: boolean;
};

/**
 * Ensure directory exists
 */
export function ensureDir(dirPath: string, opts: FsOptions): void {
  if (opts.dryRun) return;

  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    return;
  }

  if (!opts.force) {
    // directory already exists, silently skip
    return;
  }
}

/**
 * Write file safely with overwrite control
 */
export function writeFileSafe(
  filePath: string,
  content: string,
  opts: FsOptions
): void {
  if (opts.dryRun) return;

  const exists = fs.existsSync(filePath);

  if (exists && !opts.force) {
    throw new Error(`File already exists: ${filePath}`);
  }

  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content.trimStart(), "utf8");
}
