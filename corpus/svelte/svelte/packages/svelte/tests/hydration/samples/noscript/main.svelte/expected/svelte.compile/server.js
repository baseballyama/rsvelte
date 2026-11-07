import * as $ from 'svelte/internal/server';
import { onMount } from "svelte";

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let count = 0;

		onMount(() => count++);
		$$renderer.push(`<noscript>JavaScript is required for this site.</noscript> <h1>Hello!</h1><p>Count: ${$.escape(count)}</p>`);
	});
}