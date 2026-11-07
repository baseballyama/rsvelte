import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { AccordionItem, Accordion, Input, Textarea, Button, Label, A } from "flowbite-svelte";

var root = $.from_html(`<form method="POST"><!> <!> <!> <!> <!> <!> <!></form>`);
var root_1 = $.from_html(`<p class="mb-2 text-gray-500 dark:text-gray-400">Lorem ipsum dolor sit amet, consectetur adipisicing elit. Illo ab necessitatibus sint explicabo ...</p> <ul class="list-disc ps-5 text-gray-500 dark:text-gray-400"><li><a href="/" target="_blank" rel="noreferrer" class="text-blue-600 hover:underline dark:text-blue-500">Lorem ipsum</a></li> <li><a href="https://tailwindui.com/" rel="noreferrer" target="_blank" class="text-blue-600 hover:underline dark:text-blue-500">Tailwind UI</a></li></ul>`, 1);
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

	Accordion(node_1, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_2();
			var node_2 = $.first_child(fragment_1);

			{
				const header = ($$anchor) => {
					$.next();

					var text_1 = $.text('My Header 1');

					$.append($$anchor, text_1);
				};

				AccordionItem(node_2, {
					header,
					children: ($$anchor, $$slotProps) => {
						var form = root();
						var node_3 = $.child(form);

						Label(node_3, {
							for: 'name',
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_2 = $.text('Name');

								$.append($$anchor, text_2);
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

						var node_5 = $.sibling(node_4, 2);

						Label(node_5, {
							for: 'email',
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_3 = $.text('Email');

								$.append($$anchor, text_3);
							},
							$$slots: { default: true }
						});

						var node_6 = $.sibling(node_5, 2);

						Input(node_6, {
							id: 'email',
							type: 'email',
							get value() {
								return $.get(email);
							},

							set value($$value) {
								$.set(email, $$value, true);
							}
						});

						var node_7 = $.sibling(node_6, 2);

						Label(node_7, {
							for: 'comment',
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_4 = $.text('Comment');

								$.append($$anchor, text_4);
							},
							$$slots: { default: true }
						});

						var node_8 = $.sibling(node_7, 2);

						Textarea(node_8, {
							id: 'comment',
							class: 'w-full',
							get value() {
								return $.get(comment);
							},

							set value($$value) {
								$.set(comment, $$value, true);
							}
						});

						var node_9 = $.sibling(node_8, 2);

						Button(node_9, {
							onclick: handleSubmit,
							class: 'mt-4',
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_5 = $.text('Submit');

								$.append($$anchor, text_5);
							},
							$$slots: { default: true }
						});

						$.reset(form);
						$.append($$anchor, form);
					},
					$$slots: { header: true, default: true }
				});
			}

			var node_10 = $.sibling(node_2, 2);

			{
				const header = ($$anchor) => {
					$.next();

					var text_6 = $.text('My Header 2');

					$.append($$anchor, text_6);
				};

				AccordionItem(node_10, {
					header,
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root_1();

						$.next(2);
						$.append($$anchor, fragment_2);
					},
					$$slots: { header: true, default: true }
				});
			}

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);

	return $.pop($$exports);
}