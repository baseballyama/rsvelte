import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<thead><tr><!></tr></thead>`);
var root_1 = $.from_html(`<table><!></table>`);

export default function _9_passing_snippets_to_components_input($$anchor, $$props) {
	var table = root_1();
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

	$.reset(table);
	$.append($$anchor, table);
}