import type { Linter } from 'eslint';

type Rules = Record<string, 'off'>;
type FlatConfigs = Linter.Config<Rules>[];
type Scope = 'eslint' | 'svelte';
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
	/**
	 * Turns off the rules that an oxlint configuration, like the content of `.oxlintrc.json`, has
	 * rsvelte run, as eslint-plugin-oxlint's function of the same name does for oxlint's rules.
	 */
	buildFromOxlintConfig(config: object, options?: BuildOptions): Linter.Config<Rules>[];
	/** {@link buildFromOxlintConfig} of a JSON or JSONC file. */
	buildFromOxlintConfigFile(file: string, options?: BuildOptions): Linter.Config<Rules>[];
};

type BuildOptions = {
	/** Also turn off the rules of `nursery` that the configuration turns on. */
	withNursery?: boolean;
};

export = plugin;
