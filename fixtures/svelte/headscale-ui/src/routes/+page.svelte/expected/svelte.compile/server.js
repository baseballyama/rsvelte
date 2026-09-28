import * as $ from 'svelte/internal/server';
import { goto } from '$app/navigation';
import { base } from '$app/paths';
import { onMount } from 'svelte';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		onMount(async () => {
			goto(`${base}/users.html`);
		});
	});
}