import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { FloatingLabelInput } from "flowbite-svelte";

var root = $.from_html(`<div id="exampleWrapper" class="grid w-full items-end gap-6 md:grid-cols-3"><!> <!> <!></div>`);

export default function Disabled($$anchor) {
	var div = root();
	var node = $.child(div);

	FloatingLabelInput(node, {
		variant: 'filled',
		id: 'disabled_filled',
		name: 'disabled_filled',
		type: 'text',
		disabled: true,
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Disabled filled');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	FloatingLabelInput(node_1, {
		variant: 'outlined',
		id: 'disabled_outlined',
		name: 'disabled_outlined',
		type: 'text',
		disabled: true,
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('Disabled outlined');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node_1, 2);

	FloatingLabelInput(node_2, {
		id: 'disabled_standard',
		name: 'disabled_standard',
		type: 'text',
		disabled: true,
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_2 = $.text('Disabled standard');

			$.append($$anchor, text_2);
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.append($$anchor, div);
}