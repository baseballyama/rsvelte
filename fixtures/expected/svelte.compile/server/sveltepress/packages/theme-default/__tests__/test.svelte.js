import * as $ from 'svelte/internal/server';
import { onMount } from 'svelte';

export const FOO = 'BAR';

export default function Test($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let count = 0;

		onMount(() => {
			// mounted
		});

		$$renderer.push(`<button>Count is: ${$.escape(count)}</button>`);
	});
}