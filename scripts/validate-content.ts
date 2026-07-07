import { ContentValidationErrors, loadContentRegistry } from "../src/content/load";
import { CONTENT_TYPES } from "../src/content/schema";

function main() {
  try {
    const registry = loadContentRegistry();
    const counts = CONTENT_TYPES.map((type) => `${type}: ${registry.records[type].length}`).join(", ");
    console.log(`Content registry OK — ${counts}`);
  } catch (error) {
    if (error instanceof ContentValidationErrors) {
      console.error(error.message);
      process.exit(1);
    }
    throw error;
  }
}

main();
