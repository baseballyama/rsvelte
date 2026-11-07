import * as $ from 'svelte/internal/server';
import { onMount } from 'svelte';
import { goto } from '$app/navigation';
import { resolve } from '$app/paths';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		onMount(() => {
			goto(resolve('/'));
		});
	});
}