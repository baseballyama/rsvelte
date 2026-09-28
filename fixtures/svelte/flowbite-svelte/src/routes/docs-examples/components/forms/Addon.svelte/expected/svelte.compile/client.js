import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Label, Input, InputAddon, ButtonGroup } from "flowbite-svelte";
import { UserCircleSolid } from "flowbite-svelte-icons";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div class="mb-6"><!> <!></div>`);

export default function Addon($$anchor) {
	var div = root_1();
	var node = $.child(div);

	Label(node, {
		for: 'website-admin',
		class: 'mb-2 block',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Username');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	ButtonGroup(node_1, {
		class: 'w-full',
		children: ($$anchor, $$slotProps) => {
			var fragment = root();
			var node_2 = $.first_child(fragment);

			InputAddon(node_2, {
				children: ($$anchor, $$slotProps) => {
					UserCircleSolid($$anchor, { class: 'h-4 w-4 text-gray-500 dark:text-gray-400' });
				},
				$$slots: { default: true }
			});

			var node_3 = $.sibling(node_2, 2);

			Input(node_3, { id: 'website-admin', placeholder: 'johndoe' });
			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.append($$anchor, div);
}