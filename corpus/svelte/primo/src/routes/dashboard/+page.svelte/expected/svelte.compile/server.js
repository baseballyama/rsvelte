import * as $ from 'svelte/internal/server';
import { goto } from '$app/navigation';
import { onMount } from 'svelte';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		onMount(async () => {
			await goto('/admin/dashboard/sites', { replaceState: true });
		});
	});
}