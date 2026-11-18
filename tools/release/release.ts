// release <command> [options]
//
//   stage --artifacts <dir> --out <dir> [--tag <vX.Y.Z>]   write the npm packages from each platform's
//                                                          build, and list them in publish order
const commands: Record<string, () => Promise<{ main(args: string[]): Promise<void> }>> = {
	stage: () => import('./stage.ts'),
};

const [name = '', ...args] = process.argv.slice(2);
if (!Object.hasOwn(commands, name)) {
	console.error(`usage: release <${Object.keys(commands).join('|')}> [options]`);
	process.exit(2);
}
await (await commands[name]!()).main(args);
