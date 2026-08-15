#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
	chmodSync,
	copyFileSync,
	existsSync,
	mkdirSync,
	mkdtempSync,
	readFileSync,
	rmSync,
	writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { basename, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const packageJson = JSON.parse(
	readFileSync(
		resolve(repoRoot, "apps/npm/language-server/package.json"),
		"utf8",
	),
);

function option(name, fallback) {
	const index = process.argv.indexOf(`--${name}`);
	return index === -1 ? fallback : process.argv[index + 1];
}

const version = option("version", packageJson.version);
const artifactRoot = resolve(
	repoRoot,
	option(
		"artifact-root",
		process.env.LANGUAGE_SERVER_ARTIFACT_ROOT || "artifacts",
	),
);
const outputRoot = resolve(
	repoRoot,
	option(
		"output",
		process.env.LANGUAGE_SERVER_ARCHIVE_ROOT || "release-artifacts",
	),
);
const targets = [
	{
		triple: "darwin-arm64",
		binary: "rsvelte-language-server",
		format: "tar.gz",
	},
	{ triple: "darwin-x64", binary: "rsvelte-language-server", format: "tar.gz" },
	{
		triple: "linux-arm64-gnu",
		binary: "rsvelte-language-server",
		format: "tar.gz",
	},
	{
		triple: "linux-x64-gnu",
		binary: "rsvelte-language-server",
		format: "tar.gz",
	},
	{
		triple: "win32-x64-msvc",
		binary: "rsvelte-language-server.exe",
		format: "zip",
	},
];

if (!/^\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?$/.test(version)) {
	throw new Error(`invalid language-server version: ${version}`);
}

rmSync(outputRoot, { recursive: true, force: true });
mkdirSync(outputRoot, { recursive: true });

const scratch = mkdtempSync(resolve(tmpdir(), "rsvelte-language-server-"));
const archives = [];

try {
	for (const { triple, binary, format } of targets) {
		const source = resolve(
			artifactRoot,
			`rsvelte-language-server-${triple}`,
			binary,
		);
		if (!existsSync(source))
			throw new Error(`missing release artifact: ${source}`);

		const rootName = `rsvelte-language-server-v${version}-${triple}`;
		const archiveRoot = resolve(scratch, rootName);
		mkdirSync(archiveRoot, { recursive: true });
		const packagedBinary = resolve(archiveRoot, binary);
		copyFileSync(source, packagedBinary);
		if (!binary.endsWith(".exe")) chmodSync(packagedBinary, 0o755);
		copyFileSync(resolve(repoRoot, "LICENSE"), resolve(archiveRoot, "LICENSE"));
		writeFileSync(
			resolve(archiveRoot, "README.md"),
			`# rsvelte language server ${version}\n\n` +
				`Target: ${triple}\n\n` +
				`Run \`${binary} --stdio\` from an LSP client. Installation and editor setup: ` +
				"https://github.com/baseballyama/rsvelte/tree/main/editors\n",
		);

		const archive = resolve(outputRoot, `${rootName}.${format}`);
		if (format === "zip") {
			execFileSync("zip", ["-q", "-r", archive, rootName], { cwd: scratch });
		} else {
			execFileSync("tar", ["-czf", archive, "-C", scratch, rootName]);
		}
		archives.push(archive);
		console.log(`[archive] ${basename(archive)}`);
		rmSync(archiveRoot, { recursive: true, force: true });
	}
} finally {
	rmSync(scratch, { recursive: true, force: true });
}

const checksums = archives
	.map((archive) => {
		const digest = createHash("sha256")
			.update(readFileSync(archive))
			.digest("hex");
		return `${digest}  ${basename(archive)}`;
	})
	.join("\n");
writeFileSync(resolve(outputRoot, "SHA256SUMS"), `${checksums}\n`);
