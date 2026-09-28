import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Listgroup, ListgroupItem, Tooltip } from "flowbite-svelte";
import { BellOutline, ClockOutline, TrashBinOutline } from "flowbite-svelte-icons";

var root = $.from_html(`<!> <!> <!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);
var root_2 = $.from_html(`<!> <!> <!> <!> <!> <!>`, 1);

export default function Tooltip_1($$anchor) {
	var fragment = root_2();
	var node = $.first_child(fragment);

	Listgroup(node, {
		horizontal: true,
		active: true,
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node_1 = $.first_child(fragment_1);

			ListgroupItem(node_1, {
				children: ($$anchor, $$slotProps) => {
					BellOutline($$anchor, {});
				},
				$$slots: { default: true }
			});

			var node_2 = $.sibling(node_1, 2);

			Tooltip(node_2, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Tooltip bell');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			var node_3 = $.sibling(node_2, 2);

			ListgroupItem(node_3, {
				children: ($$anchor, $$slotProps) => {
					ClockOutline($$anchor, {});
				},
				$$slots: { default: true }
			});

			var node_4 = $.sibling(node_3, 2);

			Tooltip(node_4, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('Tooltip clock');

					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});

			var node_5 = $.sibling(node_4, 2);

			ListgroupItem(node_5, {
				id: 'trash',
				children: ($$anchor, $$slotProps) => {
					TrashBinOutline($$anchor, {});
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var node_6 = $.sibling(node, 2);

	Tooltip(node_6, {
		triggeredBy: '#trash',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_2 = $.text('Tooltip trash');

			$.append($$anchor, text_2);
		},
		$$slots: { default: true }
	});

	var node_7 = $.sibling(node_6, 2);

	Listgroup(node_7, {
		horizontal: true,
		active: true,
		children: ($$anchor, $$slotProps) => {
			var fragment_5 = root_1();
			var node_8 = $.first_child(fragment_5);

			ListgroupItem(node_8, {
				id: 'profile',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_3 = $.text('Profile');

					$.append($$anchor, text_3);
				},
				$$slots: { default: true }
			});

			var node_9 = $.sibling(node_8, 2);

			ListgroupItem(node_9, {
				id: 'settings',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_4 = $.text('Settings');

					$.append($$anchor, text_4);
				},
				$$slots: { default: true }
			});

			var node_10 = $.sibling(node_9, 2);

			ListgroupItem(node_10, {
				id: 'message',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_5 = $.text('Messages');

					$.append($$anchor, text_5);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_5);
		},
		$$slots: { default: true }
	});

	var node_11 = $.sibling(node_7, 2);

	Tooltip(node_11, {
		triggeredBy: '#profile',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_6 = $.text('Tooltip profile');

			$.append($$anchor, text_6);
		},
		$$slots: { default: true }
	});

	var node_12 = $.sibling(node_11, 2);

	Tooltip(node_12, {
		triggeredBy: '#settings',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_7 = $.text('Tooltip settings');

			$.append($$anchor, text_7);
		},
		$$slots: { default: true }
	});

	var node_13 = $.sibling(node_12, 2);

	Tooltip(node_13, {
		triggeredBy: '#message',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_8 = $.text('Tooltip messages');

			$.append($$anchor, text_8);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}