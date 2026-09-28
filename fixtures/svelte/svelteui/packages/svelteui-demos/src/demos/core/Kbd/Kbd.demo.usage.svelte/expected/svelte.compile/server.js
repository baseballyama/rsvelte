import * as $ from 'svelte/internal/server';
import { Center, Kbd } from '@svelteuidev/core';

const code = `
<script>
    import { Kbd } from '@svelteuidev/core';
<\/script>

<Kbd>⌘</Kbd> + <Kbd>shift</Kbd> + <Kbd>M</Kbd>
	`;

export const type = 'demo';
export const configuration = { code };

export default function Kbd_demo_usage($$renderer) {
	Center($$renderer, {
		children: ($$renderer) => {
			Kbd($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->⌘`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> + `);

			Kbd($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->shift`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> + `);

			Kbd($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->M`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}