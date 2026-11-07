import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div class=" text-kui-light-gray-900 dark:text-kui-dark-gray-900 w-full overflow-auto text-sm"><table class="w-full"><!></table></div>`);

export default function Table($$anchor, $$props) {
	let children = $.prop($$props, 'children', 3, undefined);
	var div = root();
	var table = $.child(div);
	var node = $.child(table);

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

	$.reset(table);
	$.reset(div);
	$.append($$anchor, div);
}