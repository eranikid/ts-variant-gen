import * as path from "path";
import { register } from "ts-node";

if (process.argv.length != 3) {
  console.error("Usage: ts-variant-gen [js definition file]");
  process.exit(1);
}

const fileName = process.argv[2];

const filePath = path.join(process.cwd(), fileName);

register();
require(filePath);
