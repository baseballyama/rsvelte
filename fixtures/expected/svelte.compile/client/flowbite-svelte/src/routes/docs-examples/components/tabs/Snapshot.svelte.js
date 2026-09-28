import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Tabs, TabItem, Label, Button, Input, Textarea, A } from "flowbite-svelte";

var root = $.from_html(`<form method="POST"><!> <!> <label for="email">Email</label> <!> <label for="comment">Comment</label> <!> <!></form>`);
var root_1 = $.from_html(`<p class="text-sm text-gray-500 dark:text-gray-400"><b>Settings:</b> Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>`);
var root_2 = $.from_html(`<!> <!>`, 1);

export default function Snapshot($$anchor, $$props) {
	$.push($$props, true);

	let name = $.state("");
	let email = $.state("");
	let comment = $.state("");

	const snapshot = {
		capture: () => ({
			name: $.get(name),
			email: $.get(email),
			comment: $.get(comment)
		}),

		restore: (value) => {
			$.set(name, value.name, true);
			$.set(email, value.email, true);
			$.set(comment, value.comment, true);
		}
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		alert(`Submitted:\nName: ${$.get(name)}\nEmail: ${$.get(email)}\nComment: ${$.get(comment)}`);
	};

	var $$exports = { snapshot };
	var fragment = root_2();
	var node = $.first_child(fragment);

	A(node, {
		href: '/',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Go home');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Tabs(node_1, {
		role: 'tablist',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_2();
			var node_2 = $.first_child(fragment_1);

			TabItem(node_2, {
				open: true,
				title: 'Profile',
				children: ($$anchor, $$slotProps) => {
					var form = root();
					var node_3 = $.child(form);

					Label(node_3, {
						for: 'name',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text('Name');

							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});

					var node_4 = $.sibling(node_3, 2);

					Input(node_4, {
						id: 'name',
						type: 'text',
						get value() {
							return $.get(name);
						},

						set value($$value) {
							$.set(name, $$value, true);
						}
					});

					var node_5 = $.sibling(node_4, 4);

					Input(node_5, {
						id: 'email',
						type: 'email',
						get value() {
							return $.get(email);
						},

						set value($$value) {
							$.set(email, $$value, true);
						}
					});

					var node_6 = $.sibling(node_5, 4);

					Textarea(node_6, {
						id: 'comment',
						class: 'w-full',
						get value() {
							return $.get(comment);
						},

						set value($$value) {
							$.set(comment, $$value, true);
						}
					});

					var node_7 = $.sibling(node_6, 2);

					Button(node_7, {
						onclick: handleSubmit,
						class: 'mt-4',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_2 = $.text('Submit');

							$.append($$anchor, text_2);
						},
						$$slots: { default: true }
					});

					$.reset(form);
					$.append($$anchor, form);
				},
				$$slots: { default: true }
			});

			var node_8 = $.sibling(node_2, 2);

			TabItem(node_8, {
				title: 'Settings',
				children: ($$anchor, $$slotProps) => {
					var p = root_1();

					$.append($$anchor, p);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);

	return $.pop($$exports);
}