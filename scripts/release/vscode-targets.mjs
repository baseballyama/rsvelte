// The Marketplace scans every file in a VSIX, and a universal package carrying
// all five unsigned native servers (~110 MB) fails that scan, so each target
// ships its own VSIX alongside a binary-free universal fallback.
//
// `target` is the `vsce --target` identifier; `triple` is the directory name
// `extension.ts`'s `platformTriple()` resolves at runtime. They differ for
// linux/windows, so this table is the single place the two vocabularies meet.
export const VSCODE_TARGETS = [
	{
		target: "darwin-arm64",
		triple: "darwin-arm64",
		binary: "rsvelte-language-server",
	},
	{
		target: "darwin-x64",
		triple: "darwin-x64",
		binary: "rsvelte-language-server",
	},
	{
		target: "linux-arm64",
		triple: "linux-arm64-gnu",
		binary: "rsvelte-language-server",
	},
	{
		target: "linux-x64",
		triple: "linux-x64-gnu",
		binary: "rsvelte-language-server",
	},
	{
		target: "win32-x64",
		triple: "win32-x64-msvc",
		binary: "rsvelte-language-server.exe",
	},
];
