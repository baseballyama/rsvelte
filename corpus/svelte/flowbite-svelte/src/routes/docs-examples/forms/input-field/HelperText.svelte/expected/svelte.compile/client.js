import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Input, Label, Helper } from "flowbite-svelte";

var root = $.from_html(`We’ll never share your details. Read our <a href="/" class="text-primary-600 dark:text-primary-500 font-medium hover:underline">Privacy Policy</a> .`, 1);
var root_1 = $.from_html(`<span>Your email</span> <!> <!>`, 1);

export default function HelperText($$anchor) {
	Label($$anchor, {
		class: 'flex flex-col gap-2',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_1();
			var node = $.sibling($.first_child(fragment_1), 2);

			Input(node, {
				id: 'email',
				name: 'email',
				required: true,
				placeholder: 'name@flowbite.com'
			});

			var node_1 = $.sibling(node, 2);

			Helper(node_1, {
				class: 'text-sm',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var fragment_2 = root();

					$.next(2);
					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}