import * as $ from 'svelte/internal/server';
import { Code, Text } from '@svelteuidev/core';

const code = `<script>
	import { Code, Text } from '@svelteuidev/core';
<\/script>

<Text root="a">This is a anchor now</Text>
<Text root="p">This is a paragraph</Text>
<Text root={Code}>This is a Code Component</Text>`;

export const type = 'demo';
export const configuration = { code };

export default function Text_demo_custom($$renderer) {
	Text($$renderer, {
		root: 'a',
		children: ($$renderer) => {
			$$renderer.push(`<!---->This is a anchor now`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Text($$renderer, {
		root: 'p',
		children: ($$renderer) => {
			$$renderer.push(`<!---->This is a paragraph`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Text($$renderer, {
		root: Code,
		children: ($$renderer) => {
			$$renderer.push(`<!---->This is a Code Component`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}