import * as $ from 'svelte/internal/server';
import { Box, Code, Group } from '@svelteuidev/core';

const code = `
<script>
	import { Box, Code } from '@svelteuidev/core';
<\/script>

<Box root={Code}>I am a code component now</Box>
<Box root='span'>I am a span tag</Box>`;

export const type = 'demo';
export const configuration = { code };

export default function Box_demo_custom($$renderer) {
	Group($$renderer, {
		position: 'center',
		children: ($$renderer) => {
			Box($$renderer, {
				root: Code,
				children: ($$renderer) => {
					$$renderer.push(`<!---->I am a code component now`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Box($$renderer, {
				root: 'span',
				children: ($$renderer) => {
					$$renderer.push(`<!---->I am a span tag`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}