const { pnpPlugin } = require("@yarnpkg/esbuild-plugin-pnp");
const { build } = require("esbuild");
const path = require("path");
const { chmod, writeFile, mkdir } = require("fs/promises");

const packageJson = require("./package.json");

main();

async function main() {
    const options = {
        platform: "node",
        target: "node14",
        entryPoints: ["./src/cli.ts"],
        outfile: "./dist/canary/bundle.cjs",
        bundle: true,
        external: ["cpu-features"],
        plugins: [pnpPlugin()],
        define: {
            "process.env.CLI_NAME": JSON.stringify("fern-canary"),
            "process.env.CLI_VERSION": JSON.stringify(packageJson.version),
            "process.env.CLI_PACKAGE_NAME": JSON.stringify("@fern-api/fern-api-canary"),
            "process.env.AUTH0_DOMAIN": getEnvironmentVariable("AUTH0_DOMAIN"),
            "process.env.AUTH0_CLIENT_ID": getEnvironmentVariable("AUTH0_CLIENT_ID"),
            "process.env.DEFAULT_FIDDLE_ORIGIN": getEnvironmentVariable("DEFAULT_FIDDLE_ORIGIN"),
        },
    };

    function getEnvironmentVariable(environmentVariable) {
        const value = process.env[environmentVariable];
        if (value != null) {
            return JSON.stringify(value);
        }
        throw new Error(`Environment variable ${environmentVariable} is not defined.`);
    }

    await build(options).catch(() => process.exit(1));

    process.chdir(path.join(__dirname, "dist/canary"));

    // write cli executable
    await writeFile(
        "cli.cjs",
        `#!/usr/bin/env node

require("./bundle.cjs");`
    );
    await chmod("cli.cjs", "755");

    // write cli's package.json
    await writeFile(
        "package.json",
        JSON.stringify(
            {
                name: "@fern-api/fern-api-canary",
                version: packageJson.version,
                repository: packageJson.repository,
                files: ["bundle.cjs", "cli.cjs"],
                bin: { "fern-canary": "cli.cjs" },
            },
            undefined,
            2
        )
    );

    // write empty yarn.lock so yarn doesn't try to associate this package with the monorepo
    await writeFile("yarn.lock", "");

    // install package into new yarn.lock
    // YARN_ENABLE_IMMUTABLE_INSTALLS=false so we can modify yarn.lock even when in CI
    const { exec } = require("child_process");
    exec("YARN_ENABLE_IMMUTABLE_INSTALLS=false yarn install", undefined, (error) => {
        if (error != null) {
            console.error(error);
            process.exit(1);
        }
    });
}
