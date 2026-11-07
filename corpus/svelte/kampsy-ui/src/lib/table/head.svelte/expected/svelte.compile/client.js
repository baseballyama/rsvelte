import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<th class="h-10 px-2 text-left align-middle text-sm font-medium last:text-right"><!></th>`);

export default function Head($$anchor, $$props) {
	let children = $.prop($$props, 'children', 3, undefined);
	var th = root();
	var node = $.child(th);

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

	$.reset(th);
	$.append($$anchor, th);
}