import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

import {
	Drawer,
	CardPlaceholder,
	Button,
	Label,
	Input,
	Textarea,
	P,
	A
} from "flowbite-svelte";

import { InfoCircleSolid } from "flowbite-svelte-icons";

var root = $.from_html(`<h5 class="mb-6 inline-flex items-center text-base font-semibold text-gray-500 uppercase dark:text-gray-400"><!>Contact us</h5> <form method="dialog" class="mb-6"><div class="mb-6"><!> <!></div> <div class="mb-6"><!> <!></div> <div class="mb-6"><!> <!></div> <!></form> <!> <!>`, 1);
var root_1 = $.from_html(`<div class="text-center"><!> <!></div> <!>`, 1);

export default function Contact($$anchor) {
	let open3 = $.state(false);
	var fragment = root_1();
	var div = $.first_child(fragment);
	var node = $.child(div);

	Button(node, {
		onclick: () => $.set(open3, true),
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Show contact form');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	CardPlaceholder(node_1, { size: '2xl', class: 'mt-6' });
	$.reset(div);

	var node_2 = $.sibling(div, 2);

	Drawer(node_2, {
		get open() {
			return $.get(open3);
		},

		set open($$value) {
			$.set(open3, $$value, true);
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var h5 = $.first_child(fragment_1);
			var node_3 = $.child(h5);

			InfoCircleSolid(node_3, { class: 'me-2.5 h-5 w-5' });
			$.next();
			$.reset(h5);

			var form = $.sibling(h5, 2);
			var div_1 = $.child(form);
			var node_4 = $.child(div_1);

			Label(node_4, {
				for: 'email',
				class: 'mb-2 block',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('Your email');

					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});

			var node_5 = $.sibling(node_4, 2);

			Input(node_5, {
				id: 'email',
				name: 'email',
				required: true,
				placeholder: 'name@company.com'
			});

			$.reset(div_1);

			var div_2 = $.sibling(div_1, 2);
			var node_6 = $.child(div_2);

			Label(node_6, {
				for: 'subject',
				class: 'mb-2 block',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_2 = $.text('Subject');

					$.append($$anchor, text_2);
				},
				$$slots: { default: true }
			});

			var node_7 = $.sibling(node_6, 2);

			Input(node_7, {
				id: 'subject',
				name: 'subject',
				required: true,
				placeholder: 'Let us know how we can help you'
			});

			$.reset(div_2);

			var div_3 = $.sibling(div_2, 2);
			var node_8 = $.child(div_3);

			Label(node_8, {
				for: 'message',
				class: 'mb-2',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_3 = $.text('Your message');

					$.append($$anchor, text_3);
				},
				$$slots: { default: true }
			});

			var node_9 = $.sibling(node_8, 2);

			Textarea(node_9, {
				id: 'message',
				placeholder: 'Your message...',
				rows: 4,
				name: 'message',
				class: 'w-full'
			});

			$.reset(div_3);

			var node_10 = $.sibling(div_3, 2);

			Button(node_10, {
				type: 'submit',
				class: 'w-full',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_4 = $.text('Send message');

					$.append($$anchor, text_4);
				},
				$$slots: { default: true }
			});

			$.reset(form);

			var node_11 = $.sibling(form, 2);

			P(node_11, {
				class: 'mb-2 text-sm text-gray-500 dark:text-gray-400',
				children: ($$anchor, $$slotProps) => {
					A($$anchor, {
						href: '/',
						class: 'text-primary-600 dark:text-primary-500 hover:underline',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_5 = $.text('info@company.com');

							$.append($$anchor, text_5);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			var node_12 = $.sibling(node_11, 2);

			P(node_12, {
				class: 'text-sm text-gray-500 dark:text-gray-400',
				children: ($$anchor, $$slotProps) => {
					A($$anchor, {
						href: '/',
						class: 'text-primary-600 dark:text-primary-500 hover:underline',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_6 = $.text('212-456-7890');

							$.append($$anchor, text_6);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}