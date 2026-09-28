import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Fileupload, Label, Helper } from "flowbite-svelte";

var root = $.from_html(`<!> <!> <!>`, 1);

export default function HelperText($$anchor) {
	var fragment = root();
	var node = $.first_child(fragment);

	Label(node, {
		for: 'with_helper',
		class: 'pb-2',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Upload file');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Fileupload(node_1, { id: 'with_helper', class: 'mb-2' });

	var node_2 = $.sibling(node_1, 2);

	Helper(node_2, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('SVG, PNG, JPG or GIF (MAX. 800x400px).');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}