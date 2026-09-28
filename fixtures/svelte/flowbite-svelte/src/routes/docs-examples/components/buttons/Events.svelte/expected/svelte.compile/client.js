import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button } from "flowbite-svelte";

var root = $.from_html(`<!> <!>`, 1);

export default function Events($$anchor) {
	const btn1 = () => {
		alert("You clicked btn1.");
	};

	const btn2 = () => {
		alert("You touched btn2.");
	};

	var fragment = root();
	var node = $.first_child(fragment);

	Button(node, {
		onclick: btn1,
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Button 1');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Button(node_1, {
		ontouchstart: btn2,
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('Button 2');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}