import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<tr><!></tr>`);

export default function Row($$anchor, $$props) {
	let children = $.prop($$props, 'children', 3, undefined);
	var tr = root();
	var node = $.child(tr);

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

	$.reset(tr);
	$.append($$anchor, tr);
}