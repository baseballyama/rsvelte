import * as $ from 'svelte/internal/server';
import { onMount } from 'svelte';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		onMount(async () => {
			await 123;
		});
	});
}