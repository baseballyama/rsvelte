import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Toast } from "flowbite-svelte";
import { ImageOutline } from "flowbite-svelte-icons";

var root = $.from_html(`<!> <!>`, 1);

export default function Icons($$anchor) {
	var fragment = root();
	var node = $.first_child(fragment);

	{
		const icon = ($$anchor) => {
			ImageOutline($$anchor, { class: 'h-6 w-6' });
		};

		Toast(node, {
			icon,
			children: ($$anchor, $$slotProps) => {
				$.next();

				var text = $.text('There is a box icon.');

				$.append($$anchor, text);
			},
			$$slots: { icon: true, default: true }
		});
	}

	var node_1 = $.sibling(node, 2);

	Toast(node_1, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('No icon at all.');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}