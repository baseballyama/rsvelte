import * as $ from 'svelte/internal/server';
import { onMount } from 'svelte';

export default function Component($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let thing = 0;

		onMount(() => {
			thing = 1;

			return () => {
				console.log(thing);
			};
		});
	});
}