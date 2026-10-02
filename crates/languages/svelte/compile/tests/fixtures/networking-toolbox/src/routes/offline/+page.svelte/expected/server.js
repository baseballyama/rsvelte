import * as $ from 'svelte/internal/server';
import { onMount } from 'svelte';
import { bookmarks } from '$lib/stores/bookmarks';
import BookmarksGrid from '$lib/components/global/BookmarksGrid.svelte';
import Icon from '$lib/components/global/Icon.svelte';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let isOnline = true;

		onMount(() => {
			isOnline = navigator.onLine;

			const handleOnline = () => {
				isOnline = true;
				setTimeout(() => window.location.href = '/', 1000);
			};

			const handleOffline = () => {
				isOnline = false;
			};

			window.addEventListener('online', handleOnline);
			window.addEventListener('offline', handleOffline);

			return () => {
				window.removeEventListener('online', handleOnline);
				window.removeEventListener('offline', handleOffline);
			};
		});

		$.head('swcdds', $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>Offline - Networking Toolbox</title>`);
			});

			$$renderer.push(`<meta name="description" content="Offline mode - your bookmarked tools are still available"/>`);
		});

		$$renderer.push(`<div class="offline-page card svelte-swcdds"><div class="status-section svelte-swcdds">`);
		Icon($$renderer, { name: isOnline ? 'online' : 'offline', size: 'lg' });

		$$renderer.push(`<!----> <h1 class="svelte-swcdds">${$.escape(isOnline ? 'Back Online' : "You're Offline")}</h1> <p${$.attr_class('status svelte-swcdds', void 0, { 'online': isOnline, 'offline': !isOnline })}>${$.escape(isOnline
			? 'Connection restored! Redirecting...'
			: 'Your bookmarked tools work offline')}</p></div> `);

		if ($.store_get($$store_subs ??= {}, '$bookmarks', bookmarks).length > 0) {
			$$renderer.push(`<!--[0--><div class="bookmarks-section">`);
			BookmarksGrid($$renderer, {});
			$$renderer.push(`<!----></div>`);
		} else {
			$$renderer.push(`<!--[-1--><div class="empty-state svelte-swcdds"><p>No bookmarked tools yet</p> <a href="/" class="svelte-swcdds">Browse Tools</a></div>`);
		}

		$$renderer.push(`<!--]--></div>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}