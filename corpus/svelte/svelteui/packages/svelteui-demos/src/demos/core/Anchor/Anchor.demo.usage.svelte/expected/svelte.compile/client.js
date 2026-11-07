import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Anchor } from '@svelteuidev/core';

const code = `
<script>
    import { Anchor } from '@svelteuidev/core';
<\/script>

<Anchor>SvelteUI documentation</Anchor>
	`;

export const type = 'demo';
export const configuration = { code };

export default function Anchor_demo_usage($$anchor) {
	Anchor($$anchor, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('SvelteUI documentation');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});
}