import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Input, ButtonGroup, Button, Dropdown, DropdownItem } from "flowbite-svelte";
import { ChevronDownOutline, SearchOutline } from "flowbite-svelte-icons";

var root = $.from_html(`All categories<!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!>`, 1);

export default function Dropdown_1($$anchor) {
	ButtonGroup($$anchor, {
		class: 'w-full',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_1();
			var node = $.first_child(fragment_1);

			Button(node, {
				color: undefined,
				class: 'shrink-0 border border-gray-300 bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-300 dark:border-gray-700 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-700 dark:focus:ring-gray-800',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var fragment_2 = root();
					var node_1 = $.sibling($.first_child(fragment_2));

					ChevronDownOutline(node_1, { class: 'ms-2 h-6 w-6' });
					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			var node_2 = $.sibling(node, 2);

			Dropdown(node_2, {
				simple: true,
				children: ($$anchor, $$slotProps) => {
					var fragment_3 = root_1();
					var node_3 = $.first_child(fragment_3);

					DropdownItem(node_3, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('Shopping');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});

					var node_4 = $.sibling(node_3, 2);

					DropdownItem(node_4, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text('Images');

							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});

					var node_5 = $.sibling(node_4, 2);

					DropdownItem(node_5, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_2 = $.text('News');

							$.append($$anchor, text_2);
						},
						$$slots: { default: true }
					});

					var node_6 = $.sibling(node_5, 2);

					DropdownItem(node_6, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_3 = $.text('Finance');

							$.append($$anchor, text_3);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_3);
				},
				$$slots: { default: true }
			});

			var node_7 = $.sibling(node_2, 2);

			Input(node_7, { placeholder: 'Search' });

			var node_8 = $.sibling(node_7, 2);

			Button(node_8, {
				color: 'primary',
				class: 'p-2.5!',
				type: 'submit',
				children: ($$anchor, $$slotProps) => {
					SearchOutline($$anchor, { class: 'h-5 w-5' });
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}