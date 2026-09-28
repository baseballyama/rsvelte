import * as $ from 'svelte/internal/server';
import { onMount } from 'svelte';

let foo;

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let bar;

		onMount(() => bar = foo);
		$$renderer.push(`<div>${$.escape(typeof bar)}</div>`);
	});
}