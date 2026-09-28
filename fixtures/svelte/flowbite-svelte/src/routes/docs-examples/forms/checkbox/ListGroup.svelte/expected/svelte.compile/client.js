import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Checkbox, Listgroup } from "flowbite-svelte";

var root = $.from_html(`<li><!></li> <li><!></li> <li><!></li> <li><!></li>`, 1);
var root_1 = $.from_html(`<p class="mb-4 font-semibold text-gray-900 dark:text-white">Technology</p> <!>`, 1);

export default function ListGroup($$anchor) {
	var fragment = root_1();
	var node = $.sibling($.first_child(fragment), 2);

	Listgroup(node, {
		class: 'w-48',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var li = $.first_child(fragment_1);
			var node_1 = $.child(li);

			Checkbox(node_1, {
				classes: { div: "p-3" },
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('svelte');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			$.reset(li);

			var li_1 = $.sibling(li, 2);
			var node_2 = $.child(li_1);

			Checkbox(node_2, {
				classes: { div: "p-3" },
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('Vue JS');

					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});

			$.reset(li_1);

			var li_2 = $.sibling(li_1, 2);
			var node_3 = $.child(li_2);

			Checkbox(node_3, {
				classes: { div: "p-3" },
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_2 = $.text('React');

					$.append($$anchor, text_2);
				},
				$$slots: { default: true }
			});

			$.reset(li_2);

			var li_3 = $.sibling(li_2, 2);
			var node_4 = $.child(li_3);

			Checkbox(node_4, {
				classes: { div: "p-3" },
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_3 = $.text('Angular');

					$.append($$anchor, text_3);
				},
				$$slots: { default: true }
			});

			$.reset(li_3);
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}