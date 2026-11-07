import { regen } from './regen.ts';

/** `oracle upgrade`: after an oracle bump in package.json, regenerate every task. */
export async function main(): Promise<void> {
	const { unparseable } = await regen({});
	if (unparseable.length) process.exitCode = 1;
	console.log(
		"review `git diff --stat -- ':(glob)corpus/**/expected/**'`: every changed snapshot is an upstream behaviour change; then record the verdicts with `UPDATE_EXPECT=1 cargo test`",
	);
}
