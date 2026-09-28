import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { goto } from '$app/navigation';
import { base } from '$app/paths';
import { onMount } from 'svelte';

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	onMount(async () => {
		goto(`${base}/users.html`);
	});

	$.pop();
}