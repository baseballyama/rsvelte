import * as $ from 'svelte/internal/server';
import { Center, Text } from '@svelteuidev/core';

const code = `<script>
	import { Text } from '@svelteuidev/core';
<\/script>

<Text color='dimmed'>Dimmed text</Text>`;

export const type = 'demo';
export const configuration = { code };

export default function Text_demo_dimmed($$renderer) {
	Center($$renderer, {
		children: ($$renderer) => {
			Text($$renderer, {
				color: 'dimmed',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Dimmed text`);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});
}