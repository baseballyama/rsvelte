import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import PlaylistCard from '$lib/videos/PlaylistCard.svelte';
import { page } from '$app/stores';

var root = $.from_html(`<meta name="robots" content="noindex"/>`);
var root_1 = $.from_html(`<section class="svelte-x0ubh4"><div class="list-heading svelte-x0ubh4"><h1 class="h3">All Playlists</h1></div>  <div class="playlists"></div></section>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const $page = () => $.store_get(page, '$page', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	let playlists = $.derived(() => $$props.data.playlists);

	// We tell google to ignore filters, BUT not ?page=2...Infinity
	let isNoindexPage = $.derived(() => ['order', 'type', 'sort', 'perPage'].some((filter) => $page().url.searchParams.has(filter)));

	var section = root_1();

	$.head('x0ubh4', ($$anchor) => {
		var fragment = $.comment();
		var node = $.first_child(fragment);

		{
			var consequent = ($$anchor) => {
				var meta = root();

				$.append($$anchor, meta);
			};

			$.if(node, ($$render) => {
				if ($.get(isNoindexPage)) $$render(consequent);
			});
		}

		$.append($$anchor, fragment);
	});

	var div = $.sibling($.child(section), 2);

	$.each(div, 21, () => $.get(playlists), (playlist) => playlist.id, ($$anchor, playlist) => {
		PlaylistCard($$anchor, {
			get playlist() {
				return $.get(playlist);
			}
		});
	});

	$.reset(div);
	$.reset(section);
	$.append($$anchor, section);
	$.pop();
	$$cleanup();
}