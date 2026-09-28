import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Label, Fileupload } from "flowbite-svelte";

var root = $.from_html(`<!> <!>`, 1);

export default function File($$anchor) {
	let fileuploadprops = { id: "user_avatar" };
	var fragment = root();
	var node = $.first_child(fragment);

	Label(node, {
		class: 'pb-2',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Upload file');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Fileupload(node_1, $.spread_props(() => fileuploadprops));
	$.append($$anchor, fragment);
}