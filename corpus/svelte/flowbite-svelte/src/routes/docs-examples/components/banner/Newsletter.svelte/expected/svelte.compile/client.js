import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Banner, Skeleton, ImagePlaceholder, Input, Label, Button } from "flowbite-svelte";

var root = $.from_html(`<form action="/" class="flex w-full flex-col gap-2 md:flex-row md:items-center md:gap-4"><!> <!> <!></form>`);
var root_1 = $.from_html(`<!> <!> <!>`, 1);

export default function Newsletter($$anchor) {
	var fragment = root_1();
	var node = $.first_child(fragment);

	Skeleton(node, { class: 'py-4' });

	var node_1 = $.sibling(node, 2);

	ImagePlaceholder(node_1, { class: 'py-4' });

	var node_2 = $.sibling(node_1, 2);

	Banner(node_2, {
		classes: { insideDiv: "w-full sm:w-auto" },
		class: 'absolute',
		children: ($$anchor, $$slotProps) => {
			var form = root();
			var node_3 = $.child(form);

			Label(node_3, {
				for: 'email',
				class: 'shrink-0 text-gray-500 dark:text-gray-400',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Sign up for our newsletter');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			var node_4 = $.sibling(node_3, 2);

			Input(node_4, {
				type: 'email',
				id: 'email',
				placeholder: 'Enter your email',
				class: 'bg-white md:w-64 dark:border-gray-500 dark:bg-gray-600',
				required: true
			});

			var node_5 = $.sibling(node_4, 2);

			Button(node_5, {
				type: 'submit',
				class: 'w-full sm:w-auto',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('Subscribe');

					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});

			$.reset(form);
			$.append($$anchor, form);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}