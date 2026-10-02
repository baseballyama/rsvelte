import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<hr/> <!>`, 1);
var root_1 = $.from_html(`<h1 slot="title">Blog Post Title</h1>`);
var root_2 = $.from_html(`<div><!> <!></div> <!>`, 1);

export default function _1_input($$anchor, $$props) {
	const $$slots = $.sanitize_slots($$props);
	var fragment = root_2();
	var div = $.first_child(fragment);
	var node = $.child(div);

	$.slot(node, $$props, 'title', {}, null);

	var node_1 = $.sibling(node, 2);

	{
		var consequent = ($$anchor) => {
			var fragment_1 = root();
			var node_2 = $.sibling($.first_child(fragment_1), 2);

			$.slot(node_2, $$props, 'description', {}, null);
			$.append($$anchor, fragment_1);
		};

		$.if(node_1, ($$render) => {
			if ($$slots.description) $$render(consequent);
		});
	}

	$.reset(div);

	var node_3 = $.sibling(div, 2);

	Card(node_3, {
		$$slots: {
			title: ($$anchor, $$slotProps) => {
				var h1 = root_1();

				$.append($$anchor, h1);
			}
		}
	});

	$.append($$anchor, fragment);
}