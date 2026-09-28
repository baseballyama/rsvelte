import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button, Dropdown, Checkbox } from "flowbite-svelte";
import { ChevronDownOutline } from "flowbite-svelte-icons";

var root = $.from_html(`Dropdown checkbox<!>`, 1);
var root_1 = $.from_html(`<li><!></li> <li><!></li> <li><!></li>`, 1);
var root_2 = $.from_html(`<!> <!>`, 1);

export default function Checkbox_1($$anchor) {
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
		simple: true,
		class: 'w-44 space-y-3 p-3 text-sm',
		children: ($$anchor, $$slotProps) => {
			var fragment_2 = root_1();
			var li = $.first_child(fragment_2);
			var node_3 = $.child(li);

			Checkbox(node_3, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Default checkbox');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			$.reset(li);

			var li_1 = $.sibling(li, 2);
			var node_4 = $.child(li_1);

			Checkbox(node_4, {
				checked: true,
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('Checked state');

					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});

			$.reset(li_1);

			var li_2 = $.sibling(li_1, 2);
			var node_5 = $.child(li_2);

			Checkbox(node_5, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_2 = $.text('Default checkbox');

					$.append($$anchor, text_2);
				},
				$$slots: { default: true }
			});

			$.reset(li_2);
			$.append($$anchor, fragment_2);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}