import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button, Dropdown, DropdownItem } from "flowbite-svelte";

import {
	ChevronDownOutline,
	ChevronUpOutline,
	ChevronRightOutline,
	ChevronLeftOutline
} from "flowbite-svelte-icons";

var root = $.from_html(`<!> <!> <!> <!>`, 1);
var root_1 = $.from_html(`Dropdown top<!>`, 1);
var root_2 = $.from_html(`<!>Dropdown left`, 1);
var root_3 = $.from_html(`Dropdown right<!>`, 1);
var root_4 = $.from_html(`Dropdown bottom<!>`, 1);
var root_5 = $.from_html(`<!> <!> <!> <!> <div id="placements" class="my-8 flex h-96 flex-col items-center justify-center gap-2"><!> <div class="flex space-x-2 rtl:space-x-reverse"><!> <!></div> <!></div>`, 1);

export default function Placement($$anchor) {
	var fragment = root_5();
	var node = $.first_child(fragment);

	Dropdown(node, {
		simple: true,
		placement: 'top',
		triggeredBy: '#top-dd',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node_1 = $.first_child(fragment_1);

			DropdownItem(node_1, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Dashboard');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			var node_2 = $.sibling(node_1, 2);

			DropdownItem(node_2, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('Settings');

					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});

			var node_3 = $.sibling(node_2, 2);

			DropdownItem(node_3, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_2 = $.text('Earnings');

					$.append($$anchor, text_2);
				},
				$$slots: { default: true }
			});

			var node_4 = $.sibling(node_3, 2);

			DropdownItem(node_4, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_3 = $.text('Sign out');

					$.append($$anchor, text_3);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var node_5 = $.sibling(node, 2);

	Dropdown(node_5, {
		simple: true,
		placement: 'bottom',
		triggeredBy: '#bottom-dd',
		children: ($$anchor, $$slotProps) => {
			var fragment_2 = root();
			var node_6 = $.first_child(fragment_2);

			DropdownItem(node_6, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_4 = $.text('Dashboard');

					$.append($$anchor, text_4);
				},
				$$slots: { default: true }
			});

			var node_7 = $.sibling(node_6, 2);

			DropdownItem(node_7, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_5 = $.text('Settings');

					$.append($$anchor, text_5);
				},
				$$slots: { default: true }
			});

			var node_8 = $.sibling(node_7, 2);

			DropdownItem(node_8, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_6 = $.text('Earnings');

					$.append($$anchor, text_6);
				},
				$$slots: { default: true }
			});

			var node_9 = $.sibling(node_8, 2);

			DropdownItem(node_9, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_7 = $.text('Sign out');

					$.append($$anchor, text_7);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_2);
		},
		$$slots: { default: true }
	});

	var node_10 = $.sibling(node_5, 2);

	Dropdown(node_10, {
		simple: true,
		placement: 'right',
		triggeredBy: '#right-dd',
		children: ($$anchor, $$slotProps) => {
			var fragment_3 = root();
			var node_11 = $.first_child(fragment_3);

			DropdownItem(node_11, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_8 = $.text('Dashboard');

					$.append($$anchor, text_8);
				},
				$$slots: { default: true }
			});

			var node_12 = $.sibling(node_11, 2);

			DropdownItem(node_12, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_9 = $.text('Settings');

					$.append($$anchor, text_9);
				},
				$$slots: { default: true }
			});

			var node_13 = $.sibling(node_12, 2);

			DropdownItem(node_13, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_10 = $.text('Earnings');

					$.append($$anchor, text_10);
				},
				$$slots: { default: true }
			});

			var node_14 = $.sibling(node_13, 2);

			DropdownItem(node_14, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_11 = $.text('Sign out');

					$.append($$anchor, text_11);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_3);
		},
		$$slots: { default: true }
	});

	var node_15 = $.sibling(node_10, 2);

	Dropdown(node_15, {
		simple: true,
		placement: 'left',
		triggeredBy: '#left-dd',
		children: ($$anchor, $$slotProps) => {
			var fragment_4 = root();
			var node_16 = $.first_child(fragment_4);

			DropdownItem(node_16, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_12 = $.text('Dashboard');

					$.append($$anchor, text_12);
				},
				$$slots: { default: true }
			});

			var node_17 = $.sibling(node_16, 2);

			DropdownItem(node_17, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_13 = $.text('Settings');

					$.append($$anchor, text_13);
				},
				$$slots: { default: true }
			});

			var node_18 = $.sibling(node_17, 2);

			DropdownItem(node_18, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_14 = $.text('Earnings');

					$.append($$anchor, text_14);
				},
				$$slots: { default: true }
			});

			var node_19 = $.sibling(node_18, 2);

			DropdownItem(node_19, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_15 = $.text('Sign out');

					$.append($$anchor, text_15);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_4);
		},
		$$slots: { default: true }
	});

	var div = $.sibling(node_15, 2);
	var node_20 = $.child(div);

	Button(node_20, {
		id: 'top-dd',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var fragment_5 = root_1();
			var node_21 = $.sibling($.first_child(fragment_5));

			ChevronUpOutline(node_21, { class: 'ms-2 h-6 w-6 text-white dark:text-white' });
			$.append($$anchor, fragment_5);
		},
		$$slots: { default: true }
	});

	var div_1 = $.sibling(node_20, 2);
	var node_22 = $.child(div_1);

	Button(node_22, {
		id: 'left-dd',
		children: ($$anchor, $$slotProps) => {
			var fragment_6 = root_2();
			var node_23 = $.first_child(fragment_6);

			ChevronLeftOutline(node_23, { class: 'me-2 h-6 w-6 text-white dark:text-white' });
			$.next();
			$.append($$anchor, fragment_6);
		},
		$$slots: { default: true }
	});

	var node_24 = $.sibling(node_22, 2);

	Button(node_24, {
		id: 'right-dd',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var fragment_7 = root_3();
			var node_25 = $.sibling($.first_child(fragment_7));

			ChevronRightOutline(node_25, { class: 'ms-2 h-6 w-6 text-white dark:text-white' });
			$.append($$anchor, fragment_7);
		},
		$$slots: { default: true }
	});

	$.reset(div_1);

	var node_26 = $.sibling(div_1, 2);

	Button(node_26, {
		id: 'bottom-dd',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var fragment_8 = root_4();
			var node_27 = $.sibling($.first_child(fragment_8));

			ChevronDownOutline(node_27, { class: 'ms-2 h-6 w-6 text-white dark:text-white' });
			$.append($$anchor, fragment_8);
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.append($$anchor, fragment);
}