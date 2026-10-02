import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<thead><tr><!></tr></thead>`);
var root_1 = $.from_html(`<tr><!></tr>`);
var root_2 = $.from_html(`<table><!><tbody></tbody></table>`);

export default function _0_typing_snippets_input($$anchor, $$props) {
	var table = root_2();
	var node = $.child(table);

	{
		var consequent = ($$anchor) => {
			var thead = root();
			var tr = $.child(thead);
			var node_1 = $.child(tr);

			$.snippet(node_1, () => $$props.children);
			$.reset(tr);
			$.reset(thead);
			$.append($$anchor, thead);
		};

		$.if(node, ($$render) => {
			if ($$props.children) $$render(consequent);
		});
	}

	var tbody = $.sibling(node);

	$.each(tbody, 21, () => $$props.data, $.index, ($$anchor, d) => {
		var tr_1 = root_1();
		var node_2 = $.child(tr_1);

		$.snippet(node_2, () => $$props.row, () => $.get(d));
		$.reset(tr_1);
		$.append($$anchor, tr_1);
	});

	$.reset(tbody);
	$.reset(table);
	$.append($$anchor, table);
}