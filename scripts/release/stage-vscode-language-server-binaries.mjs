#!/usr/bin/env node

import {
	chmodSync,
	copyFileSync,
	existsSync,
	mkdirSync,
	rmSync,
} from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const artifactRoot = resolve(
	repoRoot,
	process.env.LANGUAGE_SERVER_ARTIFACT_ROOT || "artifacts",
);
const destinationRoot = resolve(
	repoRoot,
	process.env.VSCODE_NATIVE_ROOT || "apps/npm/vscode/native",
);
const targets = [
	{ triple: "darwin-arm64", binary: "rsvelte-language-server" },
	{ triple: "darwin-x64", binary: "rsvelte-language-server" },
	{ triple: "linux-arm64-gnu", binary: "rsvelte-language-server" },
	{ triple: "linux-x64-gnu", binary: "rsvelte-language-server" },
	{ triple: "win32-x64-msvc", binary: "rsvelte-language-server.exe" },
];

rmSync(destinationRoot, { recursive: true, force: true });

for (const { triple, binary } of targets) {
	const source = resolve(
		artifactRoot,
		`rsvelte-language-server-${triple}`,
		binary,
	);
	if (!existsSync(source)) {
		throw new Error(`missing VSIX language-server artifact: ${source}`);
	}

	const destinationDir = resolve(destinationRoot, triple);
	mkdirSync(destinationDir, { recursive: true });
	const destination = resolve(destinationDir, binary);
	copyFileSync(source, destination);
	if (!binary.endsWith(".exe")) chmodSync(destination, 0o755);
	console.log(`[stage-vscode] ${triple}/${binary}`);
}
