import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Center, Box } from '@svelteuidev/core';

const code = '';

export const type = 'demo';
export const configuration = { code };

export default function Tree_demo_example($$anchor) {
	const css = { bc: 'transparent' };

	Center($$anchor, {
		children: ($$anchor, $$slotProps) => {
			Box($$anchor, {
				root: 'pre',
				get css() {
					return css;
				},

				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('packages/\n        ├── svelteui-composables/\n        │   └── src/\n        │       └── lib\n        ├── svelteui-core/\n        │   └── src/\n        │       └── lib\n        ├── svelteui-dates\n        ├── svelteui-demos\n        ├── svelteui-motion\n        ├── svelteui-prism\n        └── svelteui-tests');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});
}