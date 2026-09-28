import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Dump from './Dump.svelte';
import { onMount } from 'svelte';

var root = $.from_html(`<th class="svelte-1u1fciw"> </th>`);
var root_1 = $.from_html(`<th class="svelte-1u1fciw">index</th> <!>`, 1);
var root_2 = $.from_html(`<th class="svelte-1u1fciw">Key</th> <th class="svelte-1u1fciw">Value</th>`, 1);
var root_3 = $.from_html(`<td class="svelte-1u1fciw"><!></td>`);
var root_4 = $.from_html(`<td class="svelte-1u1fciw"> </td>`);
var root_5 = $.from_html(`<tr><td class="svelte-1u1fciw"> </td><!></tr>`);
var root_6 = $.from_html(`<table class="svelte-1u1fciw"><thead><tr><!></tr></thead><tbody></tbody></table>`);

export default function Dump_1($$anchor, $$props) {
	let entries = Object.entries($$props.data);

	function getHeadersFromKeys(data) {
		return Object.keys(data.at(0) || {});
	}

	var table = root_6();
	var thead = $.child(table);
	var tr = $.child(thead);
	var node = $.child(tr);

	{
		var consequent = ($$anchor) => {
			var fragment = root_1();
			var node_1 = $.sibling($.first_child(fragment), 2);

			$.each(node_1, 17, () => getHeadersFromKeys($$props.data), $.index, ($$anchor, header) => {
				var th = root();
				var text = $.only_child(th, true);

				$.template_effect(() => $.set_text(text, $.get(header)));
				$.append($$anchor, th);
			});

			$.append($$anchor, fragment);
		};

		var d = $.derived(() => Array.isArray($$props.data));

		var alternate = ($$anchor) => {
			var fragment_1 = root_2();

			$.next(2);
			$.append($$anchor, fragment_1);
		};

		$.if(node, ($$render) => {
			if ($.get(d)) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.reset(tr);
	$.reset(thead);

	var tbody = $.sibling(thead);

	$.each(tbody, 21, () => entries, $.index, ($$anchor, $$item) => {
		var $$array = $.derived(() => $.to_array($.get($$item), 2));
		let key = () => $.get($$array)[0];
		let val = () => $.get($$array)[1];
		var tr_1 = root_5();
		var td = $.child(tr_1);
		var text_1 = $.only_child(td, true);
		var node_2 = $.sibling(td);

		{
			var consequent_1 = ($$anchor) => {
				var td_1 = root_3();
				var node_3 = $.child(td_1);

				Dump(node_3, {
					get data() {
						return val();
					}
				});

				$.reset(td_1);
				$.append($$anchor, td_1);
			};

			var d_1 = $.derived(() => Array.isArray(val()));

			var consequent_2 = ($$anchor) => {
				var td_2 = root_4();
				var text_2 = $.only_child(td_2, true);

				$.template_effect(() => $.set_text(text_2, val()));
				$.append($$anchor, td_2);
			};

			var consequent_3 = ($$anchor) => {
				var fragment_2 = $.comment();
				var node_4 = $.first_child(fragment_2);

				$.each(node_4, 17, () => Object.entries(val()), $.index, ($$anchor, $$item, $$index_1, $$array_1) => {
					var $$array_2 = $.derived(() => $.to_array($.get($$item), 2));
					let key = () => $.get($$array_2)[0];
					let value = () => $.get($$array_2)[1];
					var td_3 = root_4();
					var text_3 = $.only_child(td_3, true);

					$.template_effect(() => $.set_text(text_3, value()));
					$.append($$anchor, td_3);
				});

				$.append($$anchor, fragment_2);
			};

			var alternate_1 = ($$anchor) => {
				var td_4 = root_4();
				var text_4 = $.only_child(td_4, true);

				$.template_effect(() => $.set_text(text_4, val()));
				$.append($$anchor, td_4);
			};

			$.if(node_2, ($$render) => {
				if ($.get(d_1)) $$render(consequent_1); else if (val() instanceof Date) $$render(consequent_2, 1); else if (typeof val() === 'object' && val() !== null) $$render(consequent_3, 2); else $$render(alternate_1, -1);
			});
		}

		$.reset(tr_1);
		$.template_effect(() => $.set_text(text_1, key()));
		$.append($$anchor, tr_1);
	});

	$.reset(tbody);
	$.reset(table);
	$.append($$anchor, table);
}