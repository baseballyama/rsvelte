import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { FloatingLabelInput } from "flowbite-svelte";

var root = $.from_html(`<div id="exampleWrapper" class="grid w-full items-end gap-6 md:grid-cols-3"><!> <!> <!></div>`);

export default function Clearable($$anchor) {
	var div = root();
	var node = $.child(div);

	FloatingLabelInput(node, {
		clearable: true,
		variant: 'filled',
		id: 'clearable_filled',
		name: 'clearable_illed',
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
		clearable: true,
		variant: 'outlined',
		id: 'clearable_outlined',
		name: 'clearable_outlined',
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
		clearable: true,
		id: 'clearable_standard',
		name: 'clearable_standard',
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