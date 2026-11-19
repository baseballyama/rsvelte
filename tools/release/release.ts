// release <command> [options]
//
//   stage --artifacts <dir> --out <dir>                    write the npm packages from each platform's
//                                                          build, and list them in publish order
//   version                                                copy the version Changesets wrote into Cargo.toml
//   notes                                                  print the changelog entry of that version
//   gate --base <ref>                                      fail when a change that ships has no changeset
const commands: Record<string, () => Promise<{ main(args: string[]): Promise<void> }>> = {
	stage: () => import('./stage.ts'),
	version: () => import('./version.ts'),
	notes: () => import('./notes.ts'),
	gate: () => import('./gate.ts'),
};

const [name = '', ...args] = process.argv.slice(2);
if (!Object.hasOwn(commands, name)) {
	console.error(`usage: release <${Object.keys(commands).join('|')}> [options]`);
	process.exit(2);
}
await (await commands[name]!()).main(args);
