import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount } from 'svelte';
import { goto } from '$app/navigation';
import { page } from '$app/stores';

export default function _error($$anchor, $$props) {
	$.push($$props, true);

	onMount(() => {
		// Redirect to homepage on any error (including 404)
		goto('/', { replaceState: true });
	});

	$.pop();
}