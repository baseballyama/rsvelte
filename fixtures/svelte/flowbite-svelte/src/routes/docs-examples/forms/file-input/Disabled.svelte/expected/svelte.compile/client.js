import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Fileupload, Label } from "flowbite-svelte";

var root = $.from_html(`<!> <!>`, 1);

export default function Disabled($$anchor) {
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

	Fileupload(node_1, { disabled: true, id: 'with_helper', class: 'mb-2' });
	$.append($$anchor, fragment);
}