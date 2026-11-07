import * as $ from 'svelte/internal/server';
import { onMount } from "svelte";

export default function Output($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let count = 0;

		onMount(() => {
			console.log(count);
		});

		$$renderer.push(`<button></button>`);
	});
}