import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<hr/> <!>`, 1);
var root_1 = $.from_html(`<div><!> <!></div>`);

export default function Builtin_vars01_input($$anchor, $$props) {
	const $$slots = $.sanitize_slots($$props);
	var div = root_1();
	var node = $.child(div);

	$.slot(node, $$props, 'title', {}, null);

	var node_1 = $.sibling(node, 2);

	{
		var consequent = ($$anchor) => {
			var fragment = root();
			var node_2 = $.sibling($.first_child(fragment), 2);

			$.slot(node_2, $$props, 'description', {}, null);
			$.append($$anchor, fragment);
		};

		$.if(node_1, ($$render) => {
			if ($$slots.description) $$render(consequent);
		});
	}

	$.reset(div);
	$.append($$anchor, div);
}