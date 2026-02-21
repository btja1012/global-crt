import { build as viteBuild } from "vite";
import { rm } from "fs/promises";

async function buildVercel() {
  await rm("dist", { recursive: true, force: true });

  console.log("Building frontend for Vercel...");
  await viteBuild();
  console.log("Frontend build complete.");
}

buildVercel().catch((err) => {
  console.error(err);
  process.exit(1);
});
