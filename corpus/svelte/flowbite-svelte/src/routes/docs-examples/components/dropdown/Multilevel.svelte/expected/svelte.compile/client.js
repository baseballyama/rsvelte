import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button, Dropdown, DropdownItem } from "flowbite-svelte";
import { ChevronDownOutline, ChevronRightOutline } from "flowbite-svelte-icons";

var root = $.from_html(`Dropdown button<!>`, 1);
var root_1 = $.from_html(`Dropdown<!>`, 1);
var root_2 = $.from_html(`<!> <!> <!>`, 1);
var root_3 = $.from_html(`<!> <!> <!> <!> <!>`, 1);
var root_4 = $.from_html(`<!> <!>`, 1);

export default function Multilevel($$anchor) {
	var fragment = root_4();
	var node = $.first_child(fragment);

	Button(node, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var fragment_1 = root();
			var node_1 = $.sibling($.first_child(fragment_1));

			ChevronDownOutline(node_1, { class: 'ms-2 h-6 w-6 text-white dark:text-white' });
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node, 2);

	Dropdown(node_2, {
		simple: true,
		children: ($$anchor, $$slotProps) => {
			var fragment_2 = root_3();
			var node_3 = $.first_child(fragment_2);

			DropdownItem(node_3, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Dashboard');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			var node_4 = $.sibling(node_3, 2);

			DropdownItem(node_4, {
				class: 'flex items-center justify-between',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var fragment_3 = root_1();
					var node_5 = $.sibling($.first_child(fragment_3));

					ChevronRightOutline(node_5, { class: 'text-primary-700 ms-2 h-6 w-6 dark:text-white' });
					$.append($$anchor, fragment_3);
				},
				$$slots: { default: true }
			});

			var node_6 = $.sibling(node_4, 2);

			Dropdown(node_6, {
				simple: true,
				placement: 'right-start',
				children: ($$anchor, $$slotProps) => {
					var fragment_4 = root_2();
					var node_7 = $.first_child(fragment_4);

					DropdownItem(node_7, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text('Overview');

							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});

					var node_8 = $.sibling(node_7, 2);

					DropdownItem(node_8, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_2 = $.text('My downloads');

							$.append($$anchor, text_2);
						},
						$$slots: { default: true }
					});

					var node_9 = $.sibling(node_8, 2);

					DropdownItem(node_9, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_3 = $.text('Billing');

							$.append($$anchor, text_3);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_4);
				},
				$$slots: { default: true }
			});

			var node_10 = $.sibling(node_6, 2);

			DropdownItem(node_10, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_4 = $.text('Earnings');

					$.append($$anchor, text_4);
				},
				$$slots: { default: true }
			});

			var node_11 = $.sibling(node_10, 2);

			DropdownItem(node_11, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_5 = $.text('Sign out');

					$.append($$anchor, text_5);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_2);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}