import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Label, Input, Helper } from "flowbite-svelte";

var root = $.from_html(`<span class="font-medium">Well done!</span> Some success message.`, 1);
var root_1 = $.from_html(`<span class="font-medium">Not so well done!</span> Some error message.`, 1);
var root_2 = $.from_html(`<div class="mb-6"><!> <!> <!></div> <div class="mb-6"><!> <!> <!></div>`, 1);

export default function Validation($$anchor) {
	var fragment = root_2();
	var div = $.first_child(fragment);
	var node = $.child(div);

	Label(node, {
		for: 'success',
		color: 'green',
		class: 'mb-2 block',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Your name');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Input(node_1, { id: 'success', color: 'green', placeholder: 'Success input' });

	var node_2 = $.sibling(node_1, 2);

	Helper(node_2, {
		class: 'mt-2',
		color: 'green',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();

			$.next();
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.reset(div);

	var div_1 = $.sibling(div, 2);
	var node_3 = $.child(div_1);

	Label(node_3, {
		for: 'error',
		color: 'red',
		class: 'mb-2 block',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('Your name');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	var node_4 = $.sibling(node_3, 2);

	Input(node_4, { id: 'error', color: 'red', placeholder: 'Error input' });

	var node_5 = $.sibling(node_4, 2);

	Helper(node_5, {
		class: 'mt-2',
		color: 'red',
		children: ($$anchor, $$slotProps) => {
			var fragment_2 = root_1();

			$.next();
			$.append($$anchor, fragment_2);
		},
		$$slots: { default: true }
	});

	$.reset(div_1);
	$.append($$anchor, fragment);
}