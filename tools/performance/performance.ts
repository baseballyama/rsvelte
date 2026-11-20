// performance <command> [options]
//
//   ratchet [--update] [--instructions] [--json <file>]   the allocation (and instruction) ratchet
//   ratchet-linux [--update]                              the ratchet with instruction counts, in ratchet-linux.Dockerfile
//   cache-profile <config.json> <report.json>             cachegrind's cache and branch profile
//   hardware-counters <config.json> <report.json>         Linux hardware counters through perf stat
//   macos-cycles <config.json> <report.json> [--max-load <n>] [--allow-busy]
//                                                         macOS CPU cycles and instructions
const commands: Record<string, () => Promise<{ main(args: string[]): Promise<void> }>> = {
	ratchet: () => import('./ratchet.ts'),
	'ratchet-linux': () => import('./ratchet-linux.ts'),
	'cache-profile': () => import('./cache-profile.ts'),
	'hardware-counters': () => import('./hardware-counters.ts'),
	'macos-cycles': () => import('./macos-cycles.ts'),
};

const [name = '', ...args] = process.argv.slice(2);
if (!Object.hasOwn(commands, name)) {
	console.error(`usage: performance <${Object.keys(commands).join('|')}> [options]`);
	process.exit(2);
}
await (await commands[name]!()).main(args);
