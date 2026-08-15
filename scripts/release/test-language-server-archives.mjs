#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import {
	existsSync,
	mkdtempSync,
	mkdirSync,
	readFileSync,
	rmSync,
	statSync,
	writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const scratch = mkdtempSync(resolve(tmpdir(), "rsvelte-archive-test-"));
const artifacts = resolve(scratch, "artifacts");
const output = resolve(scratch, "output");
const targets = [
	["darwin-arm64", "rsvelte-language-server"],
	["darwin-x64", "rsvelte-language-server"],
	["linux-arm64-gnu", "rsvelte-language-server"],
	["linux-x64-gnu", "rsvelte-language-server"],
	["win32-x64-msvc", "rsvelte-language-server.exe"],
];

const launcherPackage = JSON.parse(
	readFileSync(
		resolve(repoRoot, "apps/npm/language-server/package.json"),
		"utf8",
	),
);
for (const [triple, binary] of targets) {
	const name = `@rsvelte/language-server-${triple}`;
	const metadata = JSON.parse(
		readFileSync(
			resolve(repoRoot, `apps/npm/language-server-${triple}/package.json`),
			"utf8",
		),
	);
	if (metadata.name !== name || metadata.version !== launcherPackage.version) {
		throw new Error(`${name} is not versioned with @rsvelte/language-server`);
	}
	if (launcherPackage.optionalDependencies?.[name] !== "workspace:^") {
		throw new Error(`@rsvelte/language-server does not install ${name}`);
	}
	if (!metadata.files?.includes(binary)) {
		throw new Error(`${name} does not publish ${binary}`);
	}
	if (triple.startsWith("linux-") && metadata.libc?.[0] !== "glibc") {
		throw new Error(`${name} does not reject incompatible musl installs`);
	}
}

try {
	for (const [triple, binary] of targets) {
		const directory = resolve(artifacts, `rsvelte-language-server-${triple}`);
		mkdirSync(directory, { recursive: true });
		writeFileSync(resolve(directory, binary), `${triple}\n`);
	}

	const staged = resolve(scratch, "vscode-native");
	execFileSync(
		process.execPath,
		[
			resolve(
				repoRoot,
				"scripts/release/stage-vscode-language-server-binaries.mjs",
			),
		],
		{
			stdio: "inherit",
			env: {
				...process.env,
				LANGUAGE_SERVER_ARTIFACT_ROOT: artifacts,
				VSCODE_NATIVE_ROOT: staged,
			},
		},
	);
	for (const [triple, binary] of targets) {
		const path = resolve(staged, triple, binary);
		if (!existsSync(path))
			throw new Error(`VSIX staging omitted ${triple}/${binary}`);
		if (!binary.endsWith(".exe") && (statSync(path).mode & 0o111) === 0) {
			throw new Error(
				`VSIX staging removed the executable bit from ${triple}/${binary}`,
			);
		}
	}

	execFileSync(
		process.execPath,
		[
			resolve(repoRoot, "scripts/release/package-language-server-archives.mjs"),
			"--version",
			"1.2.3",
			"--artifact-root",
			artifacts,
			"--output",
			output,
		],
		{ stdio: "inherit" },
	);

	for (const [triple, binary] of targets) {
		const root = `rsvelte-language-server-v1.2.3-${triple}`;
		const archive = resolve(
			output,
			`${root}.${triple.startsWith("win32") ? "zip" : "tar.gz"}`,
		);
		const listing = triple.startsWith("win32")
			? execFileSync("unzip", ["-Z1", archive], { encoding: "utf8" })
			: execFileSync("tar", ["-tzf", archive], { encoding: "utf8" });
		for (const file of [binary, "LICENSE", "README.md"]) {
			if (!listing.split("\n").includes(`${root}/${file}`)) {
				throw new Error(`${archive} does not contain ${root}/${file}`);
			}
		}
	}

	const sums = readFileSync(resolve(output, "SHA256SUMS"), "utf8")
		.trim()
		.split("\n");
	if (
		sums.length !== targets.length ||
		sums.some((line) => !/^[a-f0-9]{64}  /.test(line))
	) {
		throw new Error("SHA256SUMS does not cover every release archive");
	}
	console.log("language-server archive packaging test passed");
} finally {
	rmSync(scratch, { recursive: true, force: true });
}
