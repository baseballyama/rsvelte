import * as $ from 'svelte/internal/server';
import { onMount } from 'svelte';

export default function Test($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { message = 'World' } = $$props;
		let count = 0;

		onMount(() => {
			console.log('mount');
		});

		$$renderer.push(`<button>Count is: ${$.escape(count)}</button> <div class="text-6">Hello, ${$.escape(message)}</div>`);
	});
}