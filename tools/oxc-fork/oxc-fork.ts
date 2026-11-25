// oxc-fork <command> [options]
//
//   rebase [--repo <dir>] [--push] [--skip-tests]   replay the fork's patches on the pinned revision
//                                                   onto the latest oxlint release and test them;
//                                                   --push pushes the result as rsvelte-pin-on-<tag>
const commands: Record<string, () => Promise<{ main(args: string[]): Promise<void> }>> = {
	rebase: () => import('./rebase.ts'),
};

const [name = '', ...args] = process.argv.slice(2);
if (!Object.hasOwn(commands, name)) {
	console.error(`usage: oxc-fork <${Object.keys(commands).join('|')}> [options]`);
	process.exit(2);
}
await (await commands[name]!()).main(args);
