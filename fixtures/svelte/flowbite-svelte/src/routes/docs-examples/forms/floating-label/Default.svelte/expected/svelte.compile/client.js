import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { FloatingLabelInput } from "flowbite-svelte";

var root = $.from_html(`<div id="exampleWrapper" class="grid w-full items-end gap-6 md:grid-cols-3"><!> <!> <!></div>`);

export default function Default($$anchor) {
	var div = root();
	var node = $.child(div);

	FloatingLabelInput(node, {
		variant: 'filled',
		id: 'floating_filled',
		name: 'floating_filled',
		type: 'text',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Floating filled');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	FloatingLabelInput(node_1, {
		variant: 'outlined',
		id: 'floating_outlined',
		name: 'floating_outlined',
		type: 'text',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('Floating outlined');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node_1, 2);

	FloatingLabelInput(node_2, {
		id: 'floating_standard',
		name: 'floating_standard',
		type: 'text',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_2 = $.text('Floating standard');

			$.append($$anchor, text_2);
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.append($$anchor, div);
}