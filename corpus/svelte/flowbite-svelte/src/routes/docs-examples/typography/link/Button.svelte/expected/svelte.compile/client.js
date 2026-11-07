import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { A } from "flowbite-svelte";

var root = $.from_html(`<p>The full link is now visible.</p>`);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function Button($$anchor) {
	let show_full_link = $.state(false);
	var fragment = root_1();
	var node = $.first_child(fragment);

	A(node, {
		asButton: true,
		onclick: () => $.set(show_full_link, !$.get(show_full_link)),
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('view full link');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	{
		var consequent = ($$anchor) => {
			var p = root();

			$.append($$anchor, p);
		};

		$.if(node_1, ($$render) => {
			if ($.get(show_full_link)) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
}