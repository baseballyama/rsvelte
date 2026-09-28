import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button, Modal, Label, Input, Checkbox } from "flowbite-svelte";

var root = $.from_html(`<span>Email</span> <!>`, 1);
var root_1 = $.from_html(`<span>Your password</span> <!>`, 1);
var root_2 = $.from_html(`<div class="flex flex-col space-y-6"><h3 class="mb-4 text-xl font-medium text-gray-900 dark:text-white">Sign in to our platform</h3> <!> <!> <!> <div class="flex items-start"><!> <a href="/" class="text-primary-700 dark:text-primary-500 ms-auto text-sm hover:underline">Lost password?</a></div> <!> <div class="text-sm font-medium text-gray-500 dark:text-gray-300">Not registered? <a href="/" class="text-primary-700 dark:text-primary-500 hover:underline">Create account</a></div></div>`);
var root_3 = $.from_html(`<!> <!>`, 1);

export default function Form($$anchor, $$props) {
	$.push($$props, true);

	let formModal = $.state(false);
	let error = $.state("");

	function onaction({ action, data }) {
		$.set(error, "");

		// Check the data validity, return false to prevent dialog closing; anything else to proceed
		if (action === "login" && data.get("password")?.length < 4) {
			$.set(error, "Password must have at least 4 characters");

			return false;
		}
	}

	var fragment = root_3();
	var node = $.first_child(fragment);

	Button(node, {
		onclick: () => $.set(formModal, true),
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Form modal');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Modal(node_1, {
		form: true,
		size: 'xs',
		onaction,
		get open() {
			return $.get(formModal);
		},

		set open($$value) {
			$.set(formModal, $$value, true);
		},

		children: ($$anchor, $$slotProps) => {
			var div = root_2();
			var node_2 = $.sibling($.child(div), 2);

			{
				var consequent = ($$anchor) => {
					Label($$anchor, {
						color: 'red',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text();

							$.template_effect(() => $.set_text(text_1, $.get(error)));
							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});
				};

				$.if(node_2, ($$render) => {
					if ($.get(error)) $$render(consequent);
				});
			}

			var node_3 = $.sibling(node_2, 2);

			Label(node_3, {
				class: 'space-y-2',
				children: ($$anchor, $$slotProps) => {
					var fragment_3 = root();
					var node_4 = $.sibling($.first_child(fragment_3), 2);

					Input(node_4, {
						type: 'email',
						name: 'email',
						placeholder: 'name@company.com',
						required: true
					});

					$.append($$anchor, fragment_3);
				},
				$$slots: { default: true }
			});

			var node_5 = $.sibling(node_3, 2);

			Label(node_5, {
				class: 'space-y-2',
				children: ($$anchor, $$slotProps) => {
					var fragment_4 = root_1();
					var node_6 = $.sibling($.first_child(fragment_4), 2);

					Input(node_6, {
						type: 'password',
						name: 'password',
						placeholder: 'min. 4 characters',
						required: true
					});

					$.append($$anchor, fragment_4);
				},
				$$slots: { default: true }
			});

			var div_1 = $.sibling(node_5, 2);
			var node_7 = $.child(div_1);

			Checkbox(node_7, {
				name: 'remember',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_2 = $.text('Remember me');

					$.append($$anchor, text_2);
				},
				$$slots: { default: true }
			});

			$.next(2);
			$.reset(div_1);

			var node_8 = $.sibling(div_1, 2);

			Button(node_8, {
				type: 'submit',
				value: 'login',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_3 = $.text('Login to your account');

					$.append($$anchor, text_3);
				},
				$$slots: { default: true }
			});

			$.next(2);
			$.reset(div);
			$.append($$anchor, div);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
	$.pop();
}