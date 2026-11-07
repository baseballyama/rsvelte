import { reportAdjustments } from './adjust.ts';
import { regen } from './regen.ts';

/** `oracle upgrade`: after an oracle bump in package.json, regenerate every task and re-check the adjustments. */
export async function main(): Promise<void> {
	const { unparseable } = await regen({});
	if (unparseable.length + reportAdjustments(false)) process.exitCode = 1;
	console.log(
		"review `git diff --stat -- ':(glob)corpus/**/expected/**'`: every changed snapshot is an upstream behaviour change",
	);
}
