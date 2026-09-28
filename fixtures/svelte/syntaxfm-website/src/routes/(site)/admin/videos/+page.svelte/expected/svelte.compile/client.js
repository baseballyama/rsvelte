import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import AdminActions from '$/lib/AdminActions.svelte';
import AdminSearch from '$/lib/AdminSearch.svelte';
import { format } from 'date-fns';

var root = $.from_html(`<a href="/admin/videos/import">Import New Videos</a>`);
var root_1 = $.from_html(`<tr><td><a> </a></td><td> </td><td> </td><td> </td></tr>`);
var root_2 = $.from_html(`<h1 class="h4">🔄 Synced Playlists</h1> <!> <div><!> <div class="table-container"><table><thead><tr><th>Title</th><th>Videos</th><th>Published At</th><th>Id</th></tr></thead><tbody></tbody></table></div></div>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	let local_playlists = $.derived(() => $$props.data.local_playlists);
	let search_text = $.state('');
	var fragment = root_2();
	var node = $.sibling($.first_child(fragment), 2);

	AdminActions(node, {
		children: ($$anchor, $$slotProps) => {
			var a = root();

			$.append($$anchor, a);
		},
		$$slots: { default: true }
	});

	var div = $.sibling(node, 2);
	var node_1 = $.child(div);

	AdminSearch(node_1, {
		get text() {
			return $.get(search_text);
		},

		set text($$value) {
			$.set(search_text, $$value, true);
		}
	});

	var div_1 = $.sibling(node_1, 2);
	var table = $.child(div_1);
	var tbody = $.sibling($.child(table));

	$.each(tbody, 21, () => $.get(local_playlists).filter((s) => s.title.toLowerCase().includes($.get(search_text).toLowerCase())), $.index, ($$anchor, playlist) => {
		var tr = root_1();
		var td = $.child(tr);
		var a_1 = $.child(td);
		var text = $.only_child(a_1, true);

		$.reset(td);

		var td_1 = $.sibling(td);
		var text_1 = $.only_child(td_1, true);
		var td_2 = $.sibling(td_1);
		var text_2 = $.only_child(td_2, true);
		var td_3 = $.sibling(td_2);
		var text_3 = $.only_child(td_3, true);

		$.reset(tr);

		$.template_effect(
			($0) => {
				$.set_attribute(a_1, 'href', `/admin/videos/${$.get(playlist).id ?? ''}`);
				$.set_text(text, $.get(playlist).title);
				$.set_text(text_1, $.get(playlist).item_count);
				$.set_text(text_2, $0);
				$.set_text(text_3, $.get(playlist).id);
			},
			[() => format($.get(playlist).created_at, 'MMM d, yyyy')]
		);

		$.append($$anchor, tr);
	});

	$.reset(tbody);
	$.reset(table);
	$.reset(div_1);
	$.reset(div);
	$.append($$anchor, fragment);
	$.pop();
}