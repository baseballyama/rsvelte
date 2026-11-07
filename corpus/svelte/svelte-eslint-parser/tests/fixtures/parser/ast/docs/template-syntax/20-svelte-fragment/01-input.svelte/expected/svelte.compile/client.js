import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<h1 slot="header">Hello</h1>`);
var root_1 = $.from_html(`<p>All rights reserved.</p> <p>Copyright (c) 2019 Svelte Industries</p>`, 1);
var root_2 = $.from_html(`<div><!> <p>Some content between header and footer</p> <!></div> <!>`, 1);

export default function _1_input($$anchor, $$props) {
	var fragment = root_2();
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
				var h1 = root();

				$.append($$anchor, h1);
			},

			footer: ($$anchor, $$slotProps) => {
				var fragment_1 = root_1();

				$.next(2);
				$.append($$anchor, fragment_1);
			}
		}
	});

	$.append($$anchor, fragment);
}