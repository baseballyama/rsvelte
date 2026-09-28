import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<tbody aria-hidden="true" class="table-row h-3"></tbody> <tfoot class="border-kui-light-gray-200 dark:border-kui-dark-gray-400 w-full border-t font-medium"><!></tfoot>`, 1);

export default function Footer($$anchor, $$props) {
	let children = $.prop($$props, 'children', 3, undefined);
	var fragment = root();
	var tfoot = $.sibling($.first_child(fragment), 2);
	var node = $.child(tfoot);

	{
		var consequent = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			$.snippet(node_1, children);
			$.append($$anchor, fragment_1);
		};

		$.if(node, ($$render) => {
			if (children()) $$render(consequent);
		});
	}

	$.reset(tfoot);
	$.append($$anchor, fragment);
}