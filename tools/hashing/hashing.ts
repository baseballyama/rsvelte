// hashing <command> [options]
//
//   benchmark [<output dir>] [<baseline commit>]   SHA-256 implementations against each other
//   integration <before binary> <after binary> <output dir>
//                                                  complete Vue compilation before and after a change
const commands: Record<string, () => Promise<{ main(args: string[]): Promise<void> }>> = {
	benchmark: () => import('./benchmark.ts'),
	integration: () => import('./integration.ts'),
};

const [name = '', ...args] = process.argv.slice(2);
if (!Object.hasOwn(commands, name)) {
	console.error(`usage: hashing <${Object.keys(commands).join('|')}> [options]`);
	process.exit(2);
}
await (await commands[name]!()).main(args);
