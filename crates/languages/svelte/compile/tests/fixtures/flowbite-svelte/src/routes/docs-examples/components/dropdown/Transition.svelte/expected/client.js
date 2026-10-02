import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button, Dropdown, DropdownItem } from "flowbite-svelte";
import { ChevronDownOutline } from "flowbite-svelte-icons";
import { scale, blur } from "svelte/transition";

var root = $.from_html(`Scale<!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`Blur<!>`, 1);

export default function Transition($$anchor) {
	var fragment = root_1();
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
		get transition() {
			return scale;
		},
		transitionParams: { duration: 800 },
		children: ($$anchor, $$slotProps) => {
			var fragment_2 = root_1();
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
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('Settings');

					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});

			var node_5 = $.sibling(node_4, 2);

			DropdownItem(node_5, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_2 = $.text('Earnings');

					$.append($$anchor, text_2);
				},
				$$slots: { default: true }
			});

			var node_6 = $.sibling(node_5, 2);

			DropdownItem(node_6, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_3 = $.text('Sign out');

					$.append($$anchor, text_3);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_2);
		},
		$$slots: { default: true }
	});

	var node_7 = $.sibling(node_2, 2);

	Button(node_7, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var fragment_3 = root_2();
			var node_8 = $.sibling($.first_child(fragment_3));

			ChevronDownOutline(node_8, { class: 'ms-2 h-6 w-6 text-white dark:text-white' });
			$.append($$anchor, fragment_3);
		},
		$$slots: { default: true }
	});

	var node_9 = $.sibling(node_7, 2);

	Dropdown(node_9, {
		simple: true,
		get transition() {
			return blur;
		},
		transitionParams: { duration: 800 },
		children: ($$anchor, $$slotProps) => {
			var fragment_4 = root_1();
			var node_10 = $.first_child(fragment_4);

			DropdownItem(node_10, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_4 = $.text('Dashboard');

					$.append($$anchor, text_4);
				},
				$$slots: { default: true }
			});

			var node_11 = $.sibling(node_10, 2);

			DropdownItem(node_11, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_5 = $.text('Settings');

					$.append($$anchor, text_5);
				},
				$$slots: { default: true }
			});

			var node_12 = $.sibling(node_11, 2);

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

			$.append($$anchor, fragment_4);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}