import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p>All rights reserved.</p> <p>Copyright (c) 2019 Svelte Industries</p>`, 1);
var root_1 = $.from_html(`<div><!> <p>Some content between header and footer</p> <!></div> <!>`, 1);

export default function _2_input($$anchor, $$props) {
	var fragment = root_1();
	var div = $.first_child(fragment);
	var node = $.child(div);

	$.slot(node, $$props, 'header', {}, ($$anchor) => {
		var text = $.text('No header was provided');

		$.append($$anchor, text);
	});

	var node_1 = $.sibling(node, 4);

	$.slot(node_1, $$props, 'footer', {}, null);
	$.reset(div);

	var node_2 = $.sibling(div, 2);

	Widget(node_2, {
		$$slots: {
			header: ($$anchor, $$slotProps) => {
				HeaderComponent($$anchor, { slot: 'header' });
			},

			footer: ($$anchor, $$slotProps) => {
				var fragment_2 = root();

				$.next(2);
				$.append($$anchor, fragment_2);
			}
		}
	});

	$.append($$anchor, fragment);
}