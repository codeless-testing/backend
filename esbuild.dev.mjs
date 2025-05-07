import * as esbuild from "esbuild";

let ctx;

try {
  ctx = await esbuild.context({
    entryPoints: ["./src/index.ts"],
    bundle: true,
    sourcemap: true,
    minify: false,
    platform: "node",
    target: "node18.6",
    packages: "external",
    define: {
      "process.env.NODE_ENV": "'development'",
    },
    outdir: "./dist/index.js",
  });

  await ctx.watch();
} catch (e) {
  console.error("An error occurred", e);
  process.exit(1);
}
