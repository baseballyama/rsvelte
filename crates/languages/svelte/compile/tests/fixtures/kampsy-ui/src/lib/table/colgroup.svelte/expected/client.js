import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<colgroup><!></colgroup>`);

export default function Colgroup($$anchor, $$props) {
	let children = $.prop($$props, 'children', 3, undefined);
	var colgroup = root();
	var node = $.child(colgroup);

	{
		var consequent = ($$anchor) => {
			var fragment = $.comment();
			var node_1 = $.first_child(fragment);

			$.snippet(node_1, children);
			$.append($$anchor, fragment);
		};

		$.if(node, ($$render) => {
			if (children()) $$render(consequent);
		});
	}

	$.reset(colgroup);
	$.append($$anchor, colgroup);
}