import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Label, Input } from "flowbite-svelte";

var root = $.from_html(`<div class="mb-6"><!> <!></div> <div class="mb-6"><!> <!></div> <div class="mb-6"><!> <!></div>`, 1);

export default function Sizes($$anchor) {
	var fragment = root();
	var div = $.first_child(fragment);
	var node = $.child(div);

	Label(node, {
		for: 'large-input',
		class: 'mb-2 block',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Large input');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Input(node_1, { id: 'large-input', size: 'lg', placeholder: 'Large input' });
	$.reset(div);

	var div_1 = $.sibling(div, 2);
	var node_2 = $.child(div_1);

	Label(node_2, {
		for: 'default-input',
		class: 'mb-2 block',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('Default input');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node_2, 2);

	Input(node_3, { id: 'default-input', placeholder: 'Default input' });
	$.reset(div_1);

	var div_2 = $.sibling(div_1, 2);
	var node_4 = $.child(div_2);

	Label(node_4, {
		for: 'small-input',
		class: 'mb-2 block',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_2 = $.text('Small input');

			$.append($$anchor, text_2);
		},
		$$slots: { default: true }
	});

	var node_5 = $.sibling(node_4, 2);

	Input(node_5, { id: 'small-input', size: 'sm', placeholder: 'Small input' });
	$.reset(div_2);
	$.append($$anchor, fragment);
}