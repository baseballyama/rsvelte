import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Fileupload, Label } from "flowbite-svelte";

var root = $.from_html(`<!> <!> <!> <!> <!> <!>`, 1);

export default function Sizes($$anchor) {
	var fragment = root();
	var node = $.first_child(fragment);

	Label(node, {
		class: 'pb-2',
		for: 'small_size',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Small file input');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Fileupload(node_1, { id: 'small_size', size: 'sm' });

	var node_2 = $.sibling(node_1, 2);

	Label(node_2, {
		class: 'py-2',
		for: 'default_size',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('Default size');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node_2, 2);

	Fileupload(node_3, { id: 'default_size' });

	var node_4 = $.sibling(node_3, 2);

	Label(node_4, {
		class: 'py-2',
		for: 'larg_size',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_2 = $.text('Large file input');

			$.append($$anchor, text_2);
		},
		$$slots: { default: true }
	});

	var node_5 = $.sibling(node_4, 2);

	Fileupload(node_5, { id: 'larg_size', size: 'lg' });
	$.append($$anchor, fragment);
}