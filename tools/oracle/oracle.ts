// oracle <command> [options]
//
//   import --from <dir> [--source id,...] [--accept-commit]   copy the registered sources into corpus/
//   regen [--task id,...] [--source id,...]                   write each oracle's output to expected/
//   upgrade                                                   regen every task after an oracle bump
//   run-all [--binary <binary>]                               write rsvelte's output to every unit's actual/
//   stats                                                     count the units
//   upstream <name> <checkout>                                copy an upstream project's test fixtures into its crate's tests
//   lint-cases [--update]                                     write ESLint's reports for the lint crate's own rule cases
//   entities                                                  vendor the Svelte compiler's entity table
//   globals                                                   vendor the global variables the lint oracle declares
//   warnings                                                  vendor the warning codes svelte-ignore accepts
//   semantic --report <file> [--inputs <dir>] [--projector <binary>] [--filter <text>] [--limit <n>]
//                                                             compare the TypeScript projection's semantics
const commands: Record<string, () => Promise<{ main(args: string[]): Promise<void> }>> = {
	import: () => import('./import.ts'),
	regen: () => import('./regen.ts'),
	upgrade: () => import('./upgrade.ts'),
	'run-all': () => import('./run-all.ts'),
	stats: () => import('./stats.ts'),
	upstream: () => import('./upstream.ts'),
	'lint-cases': () => import('./lint-cases.ts'),
	entities: () => import('./entities.ts'),
	globals: () => import('./globals.ts'),
	warnings: () => import('./warnings.ts'),
	semantic: () => import('./semantic.ts'),
};

const [name = '', ...args] = process.argv.slice(2);
if (!Object.hasOwn(commands, name)) {
	console.error(`usage: oracle <${Object.keys(commands).join('|')}> [options]`);
	process.exit(2);
}
await (await commands[name]!()).main(args);
