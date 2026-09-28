import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Label, Input, Helper } from "flowbite-svelte";

var root = $.from_html(`We’ll never share your details. Read our <a href="/" class="text-primary-600 dark:text-primary-500 font-medium hover:underline">Privacy Policy</a> .`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);

export default function Helper_1($$anchor) {
	var fragment = root_1();
	var node = $.first_child(fragment);

	Label(node, {
		class: 'mb-2 block',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Your email');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Input(node_1, {
		id: 'email',
		name: 'email',
		required: true,
		placeholder: 'name@flowbite.com'
	});

	var node_2 = $.sibling(node_1, 2);

	Helper(node_2, {
		class: 'mt-2 text-sm',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var fragment_1 = root();

			$.next(2);
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}