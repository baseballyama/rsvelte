import * as $ from 'svelte/internal/server';
import { onMount } from 'svelte';

export default function On_mount01_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		onMount(() => {
			const a = window.localStorage.getItem('myCat');

			console.log(a);
		});
	});
}