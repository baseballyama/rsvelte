import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import AdminActions from '$/lib/AdminActions.svelte';
import { enhance } from '$app/forms';
import { form_action } from '$lib/form_action';

var root = $.from_html(`<form action="/?/dump_cache" method="POST"><button>Dump Cache</button></form>`);
var root_1 = $.from_html(`<tr><td> </td></tr>`);
var root_2 = $.from_html(`<tr><td>Cache Not Available</td></tr>`);
var root_3 = $.from_html(`<h1 class="h4">Cache</h1> <!> <div class="table-container"><table><thead><tr><th>key</th></tr></thead><tbody><!></tbody></table></div>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	let cache = $.derived(() => $.fallback($$props.data.cache, () => [], true));
	var fragment = root_3();
	var node = $.sibling($.first_child(fragment), 2);

	AdminActions(node, {
		children: ($$anchor, $$slotProps) => {
			var form = root();

			$.action(form, ($$node, $$action_arg) => enhance?.($$node, $$action_arg), form_action);
			$.append($$anchor, form);
		},
		$$slots: { default: true }
	});

	var div = $.sibling(node, 2);
	var table = $.child(div);
	var tbody = $.sibling($.child(table));
	var node_1 = $.child(tbody);

	{
		var consequent = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_2 = $.first_child(fragment_1);

			$.each(node_2, 17, () => $.get(cache), $.index, ($$anchor, key) => {
				var tr = root_1();
				var td = $.child(tr);
				var text = $.only_child(td, true);

				$.reset(tr);
				$.template_effect(() => $.set_text(text, $.get(key)));
				$.append($$anchor, tr);
			});

			$.append($$anchor, fragment_1);
		};

		var alternate = ($$anchor) => {
			var tr_1 = root_2();

			$.append($$anchor, tr_1);
		};

		$.if(node_1, ($$render) => {
			if ($.get(cache).length > 0) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.reset(tbody);
	$.reset(table);
	$.reset(div);
	$.append($$anchor, fragment);
	$.pop();
}