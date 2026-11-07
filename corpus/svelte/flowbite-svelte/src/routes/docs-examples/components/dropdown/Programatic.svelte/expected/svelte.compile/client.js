import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button, Dropdown, DropdownItem, P } from "flowbite-svelte";
import { ChevronDownOutline, ChevronRightOutline } from "flowbite-svelte-icons";

var root = $.from_html(`Dropdown<!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);
var root_2 = $.from_html(`<!> <!> <!> <!> <!>`, 1);
var root_3 = $.from_html(`<!> <!> <!> <!>`, 1);

export default function Programatic($$anchor) {
	let isOpen = $.state(false);
	var fragment = root_3();
	var node = $.first_child(fragment);

	P(node, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text();

			$.template_effect(() => $.set_text(text, `Current dropdown state: ${$.get(isOpen) ? "Open" : "Closed"}`));
			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Button(node_1, {
		onclick: () => $.set(isOpen, false),
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('Close Btn');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node_1, 2);

	Button(node_2, {
		onclick: () => $.set(isOpen, true),
		children: ($$anchor, $$slotProps) => {
			$.next();

			var fragment_2 = root();
			var node_3 = $.sibling($.first_child(fragment_2));

			ChevronDownOutline(node_3, { class: 'ms-2 h-6 w-6 text-white dark:text-white' });
			$.append($$anchor, fragment_2);
		},
		$$slots: { default: true }
	});

	var node_4 = $.sibling(node_2, 2);

	Dropdown(node_4, {
		simple: true,
		get isOpen() {
			return $.get(isOpen);
		},

		set isOpen($$value) {
			$.set(isOpen, $$value, true);
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_3 = root_2();
			var node_5 = $.first_child(fragment_3);

			DropdownItem(node_5, {
				onclick: () => $.set(isOpen, false),
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_2 = $.text('Dashboard (close)');

					$.append($$anchor, text_2);
				},
				$$slots: { default: true }
			});

			var node_6 = $.sibling(node_5, 2);

			DropdownItem(node_6, {
				class: 'flex items-center justify-between',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var fragment_4 = root();
					var node_7 = $.sibling($.first_child(fragment_4));

					ChevronRightOutline(node_7, { class: 'text-primary-700 ms-2 h-6 w-6 dark:text-white' });
					$.append($$anchor, fragment_4);
				},
				$$slots: { default: true }
			});

			var node_8 = $.sibling(node_6, 2);

			Dropdown(node_8, {
				simple: true,
				placement: 'right-start',
				children: ($$anchor, $$slotProps) => {
					var fragment_5 = root_1();
					var node_9 = $.first_child(fragment_5);

					DropdownItem(node_9, {
						onclick: () => $.set(isOpen, false),
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_3 = $.text('Overview (close)');

							$.append($$anchor, text_3);
						},
						$$slots: { default: true }
					});

					var node_10 = $.sibling(node_9, 2);

					DropdownItem(node_10, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_4 = $.text('My downloads');

							$.append($$anchor, text_4);
						},
						$$slots: { default: true }
					});

					var node_11 = $.sibling(node_10, 2);

					DropdownItem(node_11, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_5 = $.text('Billing');

							$.append($$anchor, text_5);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_5);
				},
				$$slots: { default: true }
			});

			var node_12 = $.sibling(node_8, 2);

			DropdownItem(node_12, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_6 = $.text('Earnings');

					$.append($$anchor, text_6);
				},
				$$slots: { default: true }
			});

			var node_13 = $.sibling(node_12, 2);

			DropdownItem(node_13, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_7 = $.text('Sign out');

					$.append($$anchor, text_7);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_3);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}