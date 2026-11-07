import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Burger, Center } from '@svelteuidev/core';

const code = `
<script>
	import { Burger } from '@svelteuidev/core';

    let opened = false;
<\/script>

<Burger
    {opened}
    on:click={() => (opened = !opened)}
/>`;

export const type = 'demo';
export const configuration = { code };

export default function Burger_demo_usage($$anchor) {
	let opened = false;

	Center($$anchor, {
		children: ($$anchor, $$slotProps) => {
			Burger($$anchor, {
				get opened() {
					return opened;
				},
				$$events: { click: () => opened = !opened }
			});
		},
		$$slots: { default: true }
	});
}