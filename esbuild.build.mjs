import * as esbuild from "esbuild";

try {
  await esbuild.build({
    entryPoints: ["./src/index.ts"],
    bundle: true,
    sourcemap: true,
    minify: true,
    platform: "node",
    target: ["node18.6"],
    packages: "external",
    define: {
      "process.env.NODE_ENV": "'production'",
    },
    outdir: "./dist/index.js",
  });

  console.log("Server bundled successfully for production! 🚀");
} catch (e) {
  console.error("An error occurred during bundling:", error);
  process.exit(1);
}
