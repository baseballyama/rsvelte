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
import { VSCODE_TARGETS } from "./vscode-targets.mjs";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const artifactRoot = resolve(
	repoRoot,
	process.env.LANGUAGE_SERVER_ARTIFACT_ROOT || "artifacts",
);
const destinationRoot = resolve(
	repoRoot,
	process.env.VSCODE_NATIVE_ROOT || "apps/npm/vscode/native",
);

rmSync(destinationRoot, { recursive: true, force: true });

for (const { triple, binary } of VSCODE_TARGETS) {
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
