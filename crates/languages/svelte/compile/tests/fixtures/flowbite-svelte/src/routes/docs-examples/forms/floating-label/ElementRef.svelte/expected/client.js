import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { FloatingLabelInput, Button } from "flowbite-svelte";

var root = $.from_html(`<!> <!>`, 1);

export default function ElementRef($$anchor) {
	let floatingRef = $.state(void 0);
	var fragment = root();
	var node = $.first_child(fragment);

	FloatingLabelInput(node, {
		variant: 'outlined',
		id: 'element_outlined',
		name: 'element_outlined',
		type: 'text',
		class: 'my-4',
		get elementRef() {
			return $.get(floatingRef);
		},

		set elementRef($$value) {
			$.set(floatingRef, $$value, true);
		},

		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Floating filled');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Button(node_1, {
		onclick: () => {
			$.get(floatingRef)?.select();
		},

		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('Select');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}