import type { Linter } from 'eslint';

declare const plugin: {
	meta: { name: string; version: string };
	configs: {
		/** Turns off, in the files `rsvelte lint` reads, every rule it runs. */
		all: Linter.Config[];
	};
};

export default plugin;
