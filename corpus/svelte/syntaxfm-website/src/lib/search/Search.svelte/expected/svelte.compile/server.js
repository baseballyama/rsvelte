import * as $ from 'svelte/internal/server';
import { browser } from '$app/environment';
import Icon from '$lib/Icon.svelte';
import { searching } from '$state/search';

export default function Search($$renderer) {
	var $$store_subs;
	const shortcut = !browser || navigator.platform === 'MacIntel' ? '⌘' : 'Ctrl';

	$$renderer.push(`<button class="button-reset svelte-14dzhz4"${$.attr('aria-label', `Search (shortcut: ${shortcut}K)`)}>`);
	Icon($$renderer, { name: 'search' });
	$$renderer.push(`<!----> <div class="shortcut svelte-14dzhz4"><kbd class="svelte-14dzhz4">${$.escape(shortcut)}K</kbd></div></button>`);

	if ($$store_subs) $.unsubscribe_stores($$store_subs);
}