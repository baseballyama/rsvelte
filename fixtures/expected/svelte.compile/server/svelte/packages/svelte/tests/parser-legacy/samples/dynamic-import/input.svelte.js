import * as $ from 'svelte/internal/server';
import { onMount } from 'svelte';

export default function Input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		onMount(() => {
			import('./foo.js').then((foo) => {
				console.log(foo.default);
			});
		});
	});
}