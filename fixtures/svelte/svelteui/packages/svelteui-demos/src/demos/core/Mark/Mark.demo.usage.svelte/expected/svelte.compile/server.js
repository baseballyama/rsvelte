import * as $ from 'svelte/internal/server';
import { Text, Mark } from '@svelteuidev/core';

const code = `
<script>
	import { Text, Mark } from '@svelteuidev/core';
<\/script>

<Text>A bunch of text with a <Mark>highlighted bit</Mark> in it.</Text>
`;

export const type = 'demo';
export const configuration = { code };

export default function Mark_demo_usage($$renderer) {
	Text($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!---->A bunch of text with a `);

			Mark($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->highlighted bit`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> in it.`);
		},
		$$slots: { default: true }
	});
}