import * as $ from 'svelte/internal/server';
import { onMount } from 'svelte';

export default function Input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let count = 0;

		// send timeout to the void!
		onMount(() => {
			const id = setInterval(() => count++, 1000);
			const clear = () => clearInterval(id);

			return clear;
		});

		$$renderer.push(`<h1>Hello world!</h1> <div>Counter value: ${$.escape(count)}</div>`);
	});
}