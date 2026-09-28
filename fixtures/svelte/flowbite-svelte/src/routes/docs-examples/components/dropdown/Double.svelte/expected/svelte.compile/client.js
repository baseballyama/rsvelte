import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button, Dropdown, DropdownItem } from "flowbite-svelte";
import { ChevronDownOutline, ChevronUpOutline } from "flowbite-svelte-icons";

var root = $.from_html(`Left start<!>`, 1);
var root_1 = $.from_html(`Right end<!>`, 1);
var root_2 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_3 = $.from_html(`<div><!> <!></div> <!>`, 1);

export default function Double($$anchor) {
	let placement = $.state("left");
	var fragment = root_3();
	var div = $.first_child(fragment);
	var node = $.child(div);

	Button(node, {
		'data-placement': 'left-start',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var fragment_1 = root();
			var node_1 = $.sibling($.first_child(fragment_1));

			ChevronUpOutline(node_1, { class: 'ms-2 h-6 w-6 text-white dark:text-white' });
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node, 2);

	Button(node_2, {
		'data-placement': 'right-end',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var fragment_2 = root_1();
			var node_3 = $.sibling($.first_child(fragment_2));

			ChevronDownOutline(node_3, { class: 'ms-2 h-6 w-6 text-white dark:text-white' });
			$.append($$anchor, fragment_2);
		},
		$$slots: { default: true }
	});

	$.reset(div);

	var node_4 = $.sibling(div, 2);

	Dropdown(node_4, {
		simple: true,
		get placement() {
			return $.get(placement);
		},
		triggeredBy: '[data-placement]',
		children: ($$anchor, $$slotProps) => {
			var fragment_3 = root_2();
			var node_5 = $.first_child(fragment_3);

			DropdownItem(node_5, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Dashboard');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			var node_6 = $.sibling(node_5, 2);

			DropdownItem(node_6, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('Settings');

					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});

			var node_7 = $.sibling(node_6, 2);

			DropdownItem(node_7, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_2 = $.text('Earnings');

					$.append($$anchor, text_2);
				},
				$$slots: { default: true }
			});

			var node_8 = $.sibling(node_7, 2);

			DropdownItem(node_8, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_3 = $.text('Sign out');

					$.append($$anchor, text_3);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_3);
		},
		$$slots: { default: true }
	});

	$.delegated('mousedown', div, (e) => {
		const placementValue = e.target?.dataset.placement;

		if (placementValue) $.set(placement, placementValue, true);
	});

	$.append($$anchor, fragment);
}

$.delegate(['mousedown']);