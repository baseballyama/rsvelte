import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { goto } from '$app/navigation';
import { onMount } from 'svelte';

var root = $.from_html(`<div class="loading svelte-1xmjmrw"><div class="spinner svelte-1xmjmrw"></div> <p class="svelte-1xmjmrw">Loading documentation...</p></div>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	onMount(() => {
		goto('/docs/installation');
	});

	var div = root();

	$.append($$anchor, div);
	$.pop();
}