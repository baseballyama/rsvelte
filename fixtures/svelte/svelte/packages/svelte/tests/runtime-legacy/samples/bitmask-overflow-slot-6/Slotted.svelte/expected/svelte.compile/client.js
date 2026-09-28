import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div><!> <!></div>`);

export default function Slotted($$anchor, $$props) {
	let open = false;

	function toggle() {
		open = !open;
	}

	var div = root();
	var node = $.child(div);

	$.slot(
		node,
		$$props,
		'target',
		{
			get open() {
				return open;
			}
		},
		null
	);

	var node_1 = $.sibling(node, 2);

	{
		var consequent = ($$anchor) => {
			var fragment = $.comment();
			var node_2 = $.first_child(fragment);

			$.slot(node_2, $$props, 'content', {}, null);
			$.append($$anchor, fragment);
		};

		$.if(node_1, ($$render) => {
			if (open) $$render(consequent);
		});
	}

	$.reset(div);
	$.event('click', div, toggle);
	$.append($$anchor, div);
}