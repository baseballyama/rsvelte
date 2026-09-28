import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Card, Button, Label, Input, Checkbox } from "flowbite-svelte";

var root = $.from_html(`<span>Email</span> <!>`, 1);
var root_1 = $.from_html(`<span>Your password</span> <!>`, 1);
var root_2 = $.from_html(`<form class="flex flex-col space-y-6" action="/"><h3 class="text-xl font-medium text-gray-900 dark:text-white">Sign in to our platform</h3> <!> <!> <div class="flex items-start"><!> <a href="/" class="text-primary-700 dark:text-primary-500 ms-auto text-sm hover:underline">Lost password?</a></div> <!> <div class="text-sm font-medium text-gray-500 dark:text-gray-300">Not registered? <a href="/" class="text-primary-700 dark:text-primary-500 hover:underline">Create account</a></div></form>`);

export default function Form($$anchor) {
	Card($$anchor, {
		class: 'p-4 sm:p-6 md:p-8',
		children: ($$anchor, $$slotProps) => {
			var form = root_2();
			var node = $.sibling($.child(form), 2);

			Label(node, {
				class: 'space-y-2',
				children: ($$anchor, $$slotProps) => {
					var fragment_1 = root();
					var node_1 = $.sibling($.first_child(fragment_1), 2);

					Input(node_1, {
						type: 'email',
						name: 'email',
						placeholder: 'name@company.com',
						required: true
					});

					$.append($$anchor, fragment_1);
				},
				$$slots: { default: true }
			});

			var node_2 = $.sibling(node, 2);

			Label(node_2, {
				class: 'space-y-2',
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root_1();
					var node_3 = $.sibling($.first_child(fragment_2), 2);

					Input(node_3, {
						type: 'password',
						name: 'password',
						placeholder: '•••••',
						required: true
					});

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			var div = $.sibling(node_2, 2);
			var node_4 = $.child(div);

			Checkbox(node_4, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Remember me');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			$.next(2);
			$.reset(div);

			var node_5 = $.sibling(div, 2);

			Button(node_5, {
				type: 'submit',
				class: 'w-full',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('Login to your account');

					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});

			$.next(2);
			$.reset(form);
			$.append($$anchor, form);
		},
		$$slots: { default: true }
	});
}