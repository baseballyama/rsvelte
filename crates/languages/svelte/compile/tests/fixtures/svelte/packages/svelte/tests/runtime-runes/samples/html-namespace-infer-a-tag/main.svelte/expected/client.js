import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Div from './div.svelte';

var root = $.from_html(`<a><span>Hello</span></a>`);
var root_1 = $.from_html(`<div><a><span>Hello</span></a></div> <div><!></div> <!>`, 1);

export default function Main($$anchor) {
	var fragment = root_1();
	var div = $.sibling($.first_child(fragment), 2);

	{
		const test = ($$anchor) => {
			var a = root();

			$.append($$anchor, a);
		};

		var node = $.child(div);

		test(node);
		$.reset(div);
	}

	var node_1 = $.sibling(div, 2);

	Div(node_1, {
		children: ($$anchor, $$slotProps) => {
			var a_1 = root();

			$.append($$anchor, a_1);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}