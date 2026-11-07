import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { FloatingLabelInput } from "flowbite-svelte";

var root = $.from_html(`<div class="mb-6 grid items-end gap-6 md:grid-cols-3"><!> <!> <!></div> <div class="grid items-end gap-6 md:grid-cols-3"><!> <!> <!></div>`, 1);

export default function Sizes($$anchor) {
	var fragment = root();
	var div = $.first_child(fragment);
	var node = $.child(div);

	FloatingLabelInput(node, {
		size: 'small',
		variant: 'filled',
		id: 'small_filled',
		name: 'small_filled',
		type: 'text',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Small filled');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	FloatingLabelInput(node_1, {
		size: 'small',
		variant: 'outlined',
		id: 'small_outlined',
		name: 'small_outlined',
		type: 'text',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('Small outlined');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node_1, 2);

	FloatingLabelInput(node_2, {
		size: 'small',
		id: 'small_standard',
		name: 'small_standard',
		type: 'text',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_2 = $.text('Small standard');

			$.append($$anchor, text_2);
		},
		$$slots: { default: true }
	});

	$.reset(div);

	var div_1 = $.sibling(div, 2);
	var node_3 = $.child(div_1);

	FloatingLabelInput(node_3, {
		variant: 'filled',
		id: 'default_filled',
		name: 'default_filled',
		type: 'text',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_3 = $.text('Default filled');

			$.append($$anchor, text_3);
		},
		$$slots: { default: true }
	});

	var node_4 = $.sibling(node_3, 2);

	FloatingLabelInput(node_4, {
		variant: 'outlined',
		id: 'default_outlined',
		name: 'default_outlined',
		type: 'text',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_4 = $.text('Default outlined');

			$.append($$anchor, text_4);
		},
		$$slots: { default: true }
	});

	var node_5 = $.sibling(node_4, 2);

	FloatingLabelInput(node_5, {
		id: 'default_standard',
		name: 'default_standard',
		type: 'text',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_5 = $.text('Default standard');

			$.append($$anchor, text_5);
		},
		$$slots: { default: true }
	});

	$.reset(div_1);
	$.append($$anchor, fragment);
}