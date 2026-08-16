import esbuild from "esbuild";

const external = [
    "@minecraft/common",
    "@minecraft/debug-utilities",
    "@minecraft/diagnostics",
    "@minecraft/server-admin",
    "@minecraft/server-editor",
    "@minecraft/server-gametest",
    "@minecraft/server-graphics",
    "@minecraft/server-net",
    "@minecraft/server-ui",
    "@minecraft/server",
    "@minecraft/gameplay-utilities",
    "@minecraft/math",
    "@minecraft/vanilla-data"
];

esbuild.build({
    entryPoints: ["src/index.ts"],
    outfile: "scripts/main.js",
    bundle: true,
    format: "esm",
    external,
}).then(() => {
    console.log("Bundling finished!");
}).catch((error) => {
    console.error(error);
});