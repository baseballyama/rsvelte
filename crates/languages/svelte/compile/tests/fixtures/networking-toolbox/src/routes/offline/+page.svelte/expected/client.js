import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount } from 'svelte';
import { bookmarks } from '$lib/stores/bookmarks';
import BookmarksGrid from '$lib/components/global/BookmarksGrid.svelte';
import Icon from '$lib/components/global/Icon.svelte';

var root = $.from_html(`<meta name="description" content="Offline mode - your bookmarked tools are still available"/>`);
var root_1 = $.from_html(`<div class="bookmarks-section"><!></div>`);
var root_2 = $.from_html(`<div class="empty-state svelte-swcdds"><p>No bookmarked tools yet</p> <a href="/" class="svelte-swcdds">Browse Tools</a></div>`);
var root_3 = $.from_html(`<div class="offline-page card svelte-swcdds"><div class="status-section svelte-swcdds"><!> <h1 class="svelte-swcdds"> </h1> <p> </p></div> <!></div>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const $bookmarks = () => $.store_get(bookmarks, '$bookmarks', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
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

	var div = root_3();

	$.head('swcdds', ($$anchor) => {
		var meta = root();

		$.effect(() => {
			$.document.title = 'Offline - Networking Toolbox';
		});

		$.append($$anchor, meta);
	});

	var div_1 = $.child(div);
	var node = $.child(div_1);

	{
		let $0 = $.derived(() => isOnline ? 'online' : 'offline');

		Icon(node, {
			get name() {
				return $.get($0);
			},
			size: 'lg'
		});
	}

	var h1 = $.sibling(node, 2);
	var text = $.only_child(h1, true);
	var p = $.sibling(h1, 2);
	let classes;
	var text_1 = $.only_child(p, true);

	$.reset(div_1);

	var node_1 = $.sibling(div_1, 2);

	{
		var consequent = ($$anchor) => {
			var div_2 = root_1();
			var node_2 = $.child(div_2);

			BookmarksGrid(node_2, {});
			$.reset(div_2);
			$.append($$anchor, div_2);
		};

		var alternate = ($$anchor) => {
			var div_3 = root_2();

			$.append($$anchor, div_3);
		};

		$.if(node_1, ($$render) => {
			if ($bookmarks().length > 0) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.reset(div);

	$.template_effect(() => {
		$.set_text(text, isOnline ? 'Back Online' : "You're Offline");
		classes = $.set_class(p, 1, 'status svelte-swcdds', null, classes, { online: isOnline, offline: !isOnline });

		$.set_text(text_1, isOnline
			? 'Connection restored! Redirecting...'
			: 'Your bookmarked tools work offline');
	});

	$.append($$anchor, div);
	$.pop();
	$$cleanup();
}