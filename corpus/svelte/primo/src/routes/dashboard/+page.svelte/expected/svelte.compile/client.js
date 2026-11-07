import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { goto } from '$app/navigation';
import { onMount } from 'svelte';

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	onMount(async () => {
		await goto('/admin/dashboard/sites', { replaceState: true });
	});

	$.pop();
}