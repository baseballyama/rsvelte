import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import AdminActions from '$/lib/AdminActions.svelte';
import AdminSearch from '$/lib/AdminSearch.svelte';
import FormButton from '$/lib/FormButton.svelte';
import { format } from 'date-fns';

var root = $.from_html(`<input type="hidden" name="playlist_id"/>`);
var root_1 = $.from_html(`<tr><td> </td><td> </td><td> </td><td class="center"> </td><td class="center"><!></td></tr>`);

var root_2 = $.from_html(
	`<h1 class="h4">Youtube Playlists</h1> <!> <p class="small">Playlists listed here are what exists on Youtube, if you need to import or update a specific
	playlist select import/update</p> <div><!> <div class="table-container"><table><thead><tr><th>Title</th><th>Videos</th><th>Published At</th><th>Id</th><th>Action</th></tr></thead><tbody></tbody></table></div></div>`,
	1
);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	let playlists = $.derived(() => $$props.data.playlists),
		local_playlists = $.derived(() => $$props.data.local_playlists);

	let search_text = $.state('');
	var fragment = root_2();
	var node = $.sibling($.first_child(fragment), 2);

	AdminActions(node, {
		children: ($$anchor, $$slotProps) => {
			FormButton($$anchor, {
				text: 'Sync Playlists',
				thinking_text: 'Syncing...',
				action_path: '?/import'
			});
		},
		$$slots: { default: true }
	});

	var div = $.sibling(node, 4);
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

	$.each(tbody, 21, () => $.get(playlists).filter((s) => s.title.toLowerCase().includes($.get(search_text).toLowerCase())), $.index, ($$anchor, playlist) => {
		var tr = root_1();
		var td = $.child(tr);
		var text = $.only_child(td, true);
		var td_1 = $.sibling(td);
		var text_1 = $.only_child(td_1, true);
		var td_2 = $.sibling(td_1);
		var text_2 = $.only_child(td_2, true);
		var td_3 = $.sibling(td_2);
		var text_3 = $.only_child(td_3, true);
		var td_4 = $.sibling(td_3);
		var node_2 = $.child(td_4);

		{
			let $0 = $.derived(() => $.get(local_playlists).includes($.get(playlist).playlist_id) ? '🔄 Syncing' : 'Link To Local');

			FormButton(node_2, {
				get text() {
					return $.get($0);
				},
				thinking_text: 'Linking...',
				action_path: '?/import_playlist',
				children: ($$anchor, $$slotProps) => {
					var input = root();

					$.remove_input_defaults(input);
					$.template_effect(() => $.set_value(input, $.get(playlist).playlist_id));
					$.append($$anchor, input);
				},
				$$slots: { default: true }
			});
		}

		$.reset(td_4);
		$.reset(tr);

		$.template_effect(
			($0) => {
				$.set_text(text, $.get(playlist).title);
				$.set_text(text_1, $.get(playlist).videos_count);
				$.set_text(text_2, $0);
				$.set_text(text_3, $.get(playlist).playlist_id);
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