import * as $ from 'svelte/internal/server';
import { Anchor } from '@svelteuidev/core';

const code = `
<script>
    import { Anchor } from '@svelteuidev/core';
<\/script>

<Anchor>SvelteUI documentation</Anchor>
	`;

export const type = 'demo';
export const configuration = { code };

export default function Anchor_demo_usage($$renderer) {
	Anchor($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!---->SvelteUI documentation`);
		},
		$$slots: { default: true }
	});
}