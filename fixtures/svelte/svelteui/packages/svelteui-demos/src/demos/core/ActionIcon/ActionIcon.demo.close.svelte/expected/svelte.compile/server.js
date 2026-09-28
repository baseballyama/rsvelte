import * as $ from 'svelte/internal/server';
import { CloseButton, Group } from '@svelteuidev/core';

const code = `<script>
    import { CloseButton } from '@svelteuidev/core';
<\/script>

<CloseButton aria-label="Close modal" />
<CloseButton size="xl" iconSize={20} />`;

export const type = 'demo';
export const configuration = { code, toggle: true };

export default function ActionIcon_demo_close($$renderer) {
	Group($$renderer, {
		position: 'center',
		children: ($$renderer) => {
			CloseButton($$renderer, { 'aria-label': 'Close modal' });
			$$renderer.push(`<!----> `);
			CloseButton($$renderer, { size: 'xl', iconSize: 'xl' });
			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}