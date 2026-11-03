// fixtures <command> [options]
//
//   import --from <dir> [--source id,...] [--accept-commit]   copy the registered sources into fixtures/
//   regen [--task id,...] [--source id,...]                   write each oracle's output to expected/
//   upgrade                                                   regen every task, then check the adjustments
//   adjust [--write]                                          check the [[adjust]] entries
//   compare --task id --variant id [--source id,...] [--family name,...] [--report <file>]
//                                                             compare each unit's actual/ with expected/
//   check [--update]                                          every task over every unit, against parity.json
//   run-all [--binary <binary>]                               write rsvelte's output to every unit's actual/
//   stats                                                     count the units
//   crate --family name --task id,... --to <dir> [--source id,...]
//                                                             copy units into a crate's tests/fixtures/
//   import-lint <eslint-plugin-svelte checkout>               copy the upstream lint rule cases into the crates
//   entities                                                  vendor the Svelte compiler's entity table
//   semantic --report <file> [--inputs <dir>] [--projector <binary>] [--filter <text>] [--limit <n>]
//                                                             compare the TypeScript projection's semantics
const commands: Record<string, () => Promise<{ main(args: string[]): Promise<void> }>> = {
	import: () => import('./import.ts'),
	regen: () => import('./regen.ts'),
	upgrade: () => import('./upgrade.ts'),
	adjust: () => import('./adjust.ts'),
	compare: () => import('./compare.ts'),
	check: () => import('./check.ts'),
	'run-all': () => import('./run-all.ts'),
	stats: () => import('./stats.ts'),
	crate: () => import('./crate.ts'),
	'import-lint': () => import('./import-lint.ts'),
	entities: () => import('./entities.ts'),
	semantic: () => import('./semantic.ts'),
};

const [name = '', ...args] = process.argv.slice(2);
if (!Object.hasOwn(commands, name)) {
	console.error(`usage: fixtures <${Object.keys(commands).join('|')}> [options]`);
	process.exit(2);
}
await (await commands[name]!()).main(args);
