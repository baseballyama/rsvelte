// The rules `rsvelte lint` runs, read from the list a Rust test keeps equal to the implementation.
import list from '../../../eslint-plugin/rules.json' with { type: 'json' };

export type Rule = { name: string; category: string; files: string; url: string };

const fileLabels: Record<string, string> = {
	svelte: 'Svelte',
	'js-ts': 'JavaScript と TypeScript',
	'svelte+js-ts+jsx-tsx': 'Svelte、JavaScript、TypeScript',
	'svelte+vue': 'Svelte',
};

/** Where the rule's original is documented. */
export function ruleUrl(name: string): string {
	if (name.startsWith('svelte/'))
		return `https://sveltejs.github.io/eslint-plugin-svelte/rules/${name.slice('svelte/'.length)}/`;
	if (name.startsWith('@typescript-eslint/'))
		return `https://typescript-eslint.io/rules/${name.slice('@typescript-eslint/'.length)}/`;
	if (!name.includes('/')) return `https://eslint.org/docs/latest/rules/${name}`;
	throw new Error(`No documentation for the rule ${name}`);
}

// `rsvelte lint` does not lint Vue files.
export const rules: Rule[] = list.rules
	.filter((rule) => rule.scope !== 'vue')
	.map((rule) => {
		const files = fileLabels[rule.files];
		if (!files) throw new Error(`No label for the files ${rule.files} of ${rule.name}`);
		return { name: rule.name, category: rule.category, files, url: ruleUrl(rule.name) };
	});
