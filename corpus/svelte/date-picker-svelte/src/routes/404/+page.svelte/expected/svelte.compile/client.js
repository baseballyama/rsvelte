import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount } from 'svelte';
import { goto } from '$app/navigation';
import { resolve } from '$app/paths';

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	onMount(() => {
		goto(resolve('/'));
	});

	$.pop();
}