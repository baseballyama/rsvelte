import type { Linter } from 'eslint';

type Rules = Record<string, 'off'>;
type FlatConfigs = Linter.Config<Rules>[];
type Scope = 'eslint' | 'typescript' | 'svelte' | 'vue';
type Category =
	| 'correctness'
	| 'suspicious'
	| 'pedantic'
	| 'perf'
	| 'style'
	| 'restriction'
	| 'nursery';

declare const plugin: {
	meta: { name: string; version: string };
	configs: {
		/** `.eslintrc`: turns off the rules of `correctness`. */
		recommended: Linter.LegacyConfig<Rules>;
		/** `.eslintrc`: turns off every rule rsvelte runs, except those of `nursery`. */
		all: Linter.LegacyConfig<Rules>;
		/** Turns off every rule rsvelte runs, except those of `nursery`. */
		'flat/all': FlatConfigs;
		/** Turns off the rules of `correctness`. */
		'flat/recommended': FlatConfigs;
	} & { [K in `flat/${Scope | Category}`]: FlatConfigs };
};

export = plugin;
