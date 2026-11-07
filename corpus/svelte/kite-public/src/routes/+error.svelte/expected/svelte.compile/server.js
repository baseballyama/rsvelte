import * as $ from 'svelte/internal/server';
import { onMount } from 'svelte';
import { goto } from '$app/navigation';
import { page } from '$app/stores';

export default function _error($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		onMount(() => {
			// Redirect to homepage on any error (including 404)
			goto('/', { replaceState: true });
		});
	});
}