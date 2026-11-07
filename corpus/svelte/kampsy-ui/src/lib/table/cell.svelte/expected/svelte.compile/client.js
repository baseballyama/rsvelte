import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<td><!></td>`);

export default function Cell($$anchor, $$props) {
	let klass = $.prop($$props, 'class', 3, ""),
		children = $.prop($$props, 'children', 3, undefined);

	var td = root();
	var node = $.child(td);

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

	$.reset(td);
	$.template_effect(() => $.set_class(td, 1, `px-2 py-2.5 align-middle last:text-right [&:has([data-cell-link=true])]:p-0 [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px] ${klass() ?? ''}`));
	$.append($$anchor, td);
}