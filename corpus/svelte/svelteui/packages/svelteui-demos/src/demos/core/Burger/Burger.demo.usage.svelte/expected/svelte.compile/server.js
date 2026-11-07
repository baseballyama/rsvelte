import * as $ from 'svelte/internal/server';
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

export default function Burger_demo_usage($$renderer) {
	let opened = false;

	Center($$renderer, {
		children: ($$renderer) => {
			Burger($$renderer, { opened });
		},
		$$slots: { default: true }
	});
}