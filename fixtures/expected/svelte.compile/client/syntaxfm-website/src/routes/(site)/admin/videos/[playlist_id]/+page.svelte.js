import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import AdminSearch from '$/lib/AdminSearch.svelte';

var root = $.from_html(`<tr><td> </td></tr>`);
var root_1 = $.from_html(`<h1> </h1> <div><!> <div class="table-container"><table><thead><tr><th>Title</th><th>Videos</th><th>Published At</th><th>Id</th><th>Action</th></tr></thead><tbody><!></tbody></table></div></div>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const { playlist, videos } = $$props.data;
	let search_text = $.state('');
	let filtered = $.derived(() => videos?.filter((s) => s.title.toLowerCase().includes($.get(search_text).toLowerCase())));
	var fragment = root_1();
	var h1 = $.first_child(fragment);
	var text = $.only_child(h1, true);
	var div = $.sibling(h1, 2);
	var node = $.child(div);

	AdminSearch(node, {
		get text() {
			return $.get(search_text);
		},

		set text($$value) {
			$.set(search_text, $$value, true);
		}
	});

	var div_1 = $.sibling(node, 2);
	var table = $.child(div_1);
	var tbody = $.sibling($.child(table));
	var node_1 = $.child(tbody);

	{
		var consequent = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_2 = $.first_child(fragment_1);

			$.each(node_2, 17, () => $.get(filtered), $.index, ($$anchor, playlist, $$index, $$array) => {
				var tr = root();
				var td = $.child(tr);
				var text_1 = $.only_child(td, true);

				$.reset(tr);
				$.template_effect(() => $.set_text(text_1, $.get(playlist).title));
				$.append($$anchor, tr);
			});

			$.append($$anchor, fragment_1);
		};

		$.if(node_1, ($$render) => {
			if ($.get(filtered)) $$render(consequent);
		});
	}

	$.reset(tbody);
	$.reset(table);
	$.reset(div_1);
	$.reset(div);
	$.template_effect(() => $.set_text(text, playlist?.title));
	$.append($$anchor, fragment);
	$.pop();
}