import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Label, ButtonGroup, Select, Clipboard, Tooltip, Helper, A } from "flowbite-svelte";
import { CheckOutline, ClipboardCleanSolid } from "flowbite-svelte-icons";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<form class="mx-auto max-w-sm"><div class="mb-2 flex items-center justify-between"><!> <!></div> <!> <!></form>`);

export default function Select_1($$anchor) {
	let selected = $.state("+1 234 456 7890");

	const phonenumbers = [
		{ value: "+1 234 456 7890", name: "+1 234 456 7890" },
		{ value: "+1 456 234 7890", name: "+1 456 234 7890" },
		{ value: "+1 432 621 3163", name: "+1 432 621 3163" }
	];

	var form = root_1();
	var div = $.child(form);
	var node = $.child(div);

	Label(node, {
		for: 'phone-numbers',
		class: 'text-sm font-medium text-gray-900 dark:text-white',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Primary phone number:');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	A(node_1, {
		href: '/',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('Manage numbers');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	$.reset(div);

	var node_2 = $.sibling(div, 2);

	ButtonGroup(node_2, {
		class: 'flex',
		children: ($$anchor, $$slotProps) => {
			var fragment = root();
			var node_3 = $.first_child(fragment);

			Select(node_3, {
				id: 'phone-numbers',
				classes: { select: "border-r-0" },
				get items() {
					return phonenumbers;
				},
				'aria-describedby': 'helper-text-explanation',
				get value() {
					return $.get(selected);
				},

				set value($$value) {
					$.set(selected, $$value, true);
				}
			});

			var node_4 = $.sibling(node_3, 2);

			{
				const children = ($$anchor, success = $.noop) => {
					var fragment_1 = root();
					var node_5 = $.first_child(fragment_1);

					Tooltip(node_5, {
						class: 'whitespace-nowrap',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_2 = $.text();

							$.template_effect(() => $.set_text(text_2, success() ? "Copied" : "Copy to clipboard"));
							$.append($$anchor, text_2);
						},
						$$slots: { default: true }
					});

					var node_6 = $.sibling(node_5, 2);

					{
						var consequent = ($$anchor) => {
							CheckOutline($$anchor, {});
						};

						var alternate = ($$anchor) => {
							ClipboardCleanSolid($$anchor, {});
						};

						$.if(node_6, ($$render) => {
							if (success()) $$render(consequent); else $$render(alternate, -1);
						});
					}

					$.append($$anchor, fragment_1);
				};

				Clipboard(node_4, {
					color: 'alternative',
					class: 'z-10 inline-flex shrink-0 items-center rounded-e-lg border border-gray-300 bg-gray-100 px-4 py-2.5 text-center text-sm font-medium text-gray-500 hover:bg-gray-200 hover:text-gray-900 focus:ring-4 focus:ring-gray-100 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-white dark:focus:ring-gray-700',
					get value() {
						return $.get(selected);
					},

					set value($$value) {
						$.set(selected, $$value, true);
					},
					children,
					$$slots: { default: true }
				});
			}

			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	var node_7 = $.sibling(node_2, 2);

	Helper(node_7, {
		id: 'helper-text-explanation',
		class: 'mt-2 text-sm',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_3 = $.text('Please set your primary phone number.');

			$.append($$anchor, text_3);
		},
		$$slots: { default: true }
	});

	$.reset(form);
	$.append($$anchor, form);
}