import * as $ from 'svelte/internal/server';
import { Center, Box } from '@svelteuidev/core';

const code = '';

export const type = 'demo';
export const configuration = { code };

export default function Tree_demo_example($$renderer) {
	const css = { bc: 'transparent' };

	Center($$renderer, {
		children: ($$renderer) => {
			Box($$renderer, {
				root: 'pre',
				css,
				children: ($$renderer) => {
					$$renderer.push(`<!---->packages/
        ├── svelteui-composables/
        │   └── src/
        │       └── lib
        ├── svelteui-core/
        │   └── src/
        │       └── lib
        ├── svelteui-dates
        ├── svelteui-demos
        ├── svelteui-motion
        ├── svelteui-prism
        └── svelteui-tests`);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});
}