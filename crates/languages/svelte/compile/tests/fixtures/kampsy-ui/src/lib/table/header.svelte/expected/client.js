import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<thead class="border-kui-light-gray-200 dark:border-kui-dark-gray-400 border-b"><!></thead>`);

export default function Header($$anchor, $$props) {
	let children = $.prop($$props, 'children', 3, undefined);
	var thead = root();
	var node = $.child(thead);

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

	$.reset(thead);
	$.append($$anchor, thead);
}