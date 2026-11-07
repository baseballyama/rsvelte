import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button, Dropdown, DropdownItem } from "flowbite-svelte";
import { ChevronDownOutline } from "flowbite-svelte-icons";
import { page } from "$app/state";

var root = $.from_html(`Dropdown button<!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<!> <!>`, 1);

export default function Active($$anchor, $$props) {
	$.push($$props, true);

	let activeUrl = $.derived(() => page.url.pathname);
	let activeClass = "text-green-500 dark:text-green-300 hover:text-green-700 dark:hover:text-green-500";
	var fragment = root_2();
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
		get activeUrl() {
			return $.get(activeUrl);
		},
		class: activeClass,
		simple: true,
		children: ($$anchor, $$slotProps) => {
			var fragment_2 = root_1();
			var node_3 = $.first_child(fragment_2);

			DropdownItem(node_3, {
				href: '/',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Home');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			var node_4 = $.sibling(node_3, 2);

			DropdownItem(node_4, {
				href: '/docs/components/dropdown',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('Dropdown');

					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});

			var node_5 = $.sibling(node_4, 2);

			DropdownItem(node_5, {
				href: '/docs/components/accordion',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_2 = $.text('Accordion');

					$.append($$anchor, text_2);
				},
				$$slots: { default: true }
			});

			var node_6 = $.sibling(node_5, 2);

			DropdownItem(node_6, {
				href: '/docs/components/alert',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_3 = $.text('Alert');

					$.append($$anchor, text_3);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_2);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
	$.pop();
}