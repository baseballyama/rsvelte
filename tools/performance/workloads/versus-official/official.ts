// `official.ts`: the official tools as an arm, through the corpus oracle's own tasks, so the work
// and the options are those the corpus's expected output came from. `compile-*` runs
// `compile(source, { filename, runes: true, generate })` from `svelte/compiler`; `format` runs
// Prettier with prettier-plugin-svelte. Both need the packages `tools/oracle` installs.
import type { Artifact, Task as OracleTask, Unit } from '../../../oracle/types.ts';
import { arm, type Output, type Task } from './node-arm.ts';

const load = async (task: Task): Promise<[OracleTask, string]> =>
	task === 'format'
		? [(await import('../../../oracle/tasks/svelte-format.ts')).default, 'default']
		: [
				(await import('../../../oracle/tasks/svelte-compile.ts')).default,
				task.slice('compile-'.length),
			];

function output(artifacts: Record<string, Artifact>): Output {
	// The compiler's error, which the oracle records instead of throwing.
	if (artifacts.error) throw new Error(artifacts.error.text.replace(/\s+/g, ' '));
	const compared: Output['compared'] = [];
	for (const part of ['js', 'css', 'svelte'])
		if (artifacts[part]) compared.push([part, artifacts[part].text]);
	return { compared, otherBytes: artifacts.warnings?.text.length ?? 0 };
}

await arm('official', import.meta.url, async (task) => {
	const [oracle, id] = await load(task);
	const variant = oracle.variants.find((v) => v.id === id);
	if (!variant) throw new Error(`${oracle.id} has no variant ${id}`);
	return (filename, source) => {
		const unit = { path: filename, lang: 'svelte' } as Unit;
		const artifacts = oracle.run(unit, source, variant);
		return artifacts instanceof Promise ? artifacts.then(output) : output(artifacts);
	};
});
