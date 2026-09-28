import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Textarea, Label } from "flowbite-svelte";

var root = $.from_html(`<!> <!>`, 1);

export default function Event($$anchor) {
	var fragment = root();
	var node = $.first_child(fragment);

	Label(node, {
		for: 'textarea-id',
		class: 'mb-2',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Your message');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Textarea(node_1, {
		clearable: true,
		clearableOnClick: () => {
			alert("Clicked clear button!");
		},
		class: 'textarea-event w-full',
		placeholder: 'Your message',
		rows: 4,
		name: 'message'
	});

	$.append($$anchor, fragment);
}