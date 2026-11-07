import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { goto } from '$app/navigation';
import { check_session } from '$lib/pocketbase/user';
import { onMount } from 'svelte';

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	onMount(async () => {
		if (await check_session()) {
			await goto('/admin/site', { replaceState: true });
		} else {
			await goto('/admin/auth', { replaceState: true });
		}
	});

	$.pop();
}