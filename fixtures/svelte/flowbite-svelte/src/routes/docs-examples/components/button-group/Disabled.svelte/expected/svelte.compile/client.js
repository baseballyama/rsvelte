import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { ButtonGroup, Button } from "flowbite-svelte";

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<div class="flex flex-col gap-4"><!> <!></div>`);

export default function Disabled($$anchor) {
	var div = root_1();
	var node = $.child(div);

	ButtonGroup(node, {
		children: ($$anchor, $$slotProps) => {
			var fragment = root();
			var node_1 = $.first_child(fragment);

			Button(node_1, {
				disabled: true,
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Profile');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			var node_2 = $.sibling(node_1, 2);

			Button(node_2, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('Settings');

					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});

			var node_3 = $.sibling(node_2, 2);

			Button(node_3, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_2 = $.text('Messages');

					$.append($$anchor, text_2);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	var node_4 = $.sibling(node, 2);

	ButtonGroup(node_4, {
		disabled: true,
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node_5 = $.first_child(fragment_1);

			Button(node_5, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_3 = $.text('Profile');

					$.append($$anchor, text_3);
				},
				$$slots: { default: true }
			});

			var node_6 = $.sibling(node_5, 2);

			Button(node_6, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_4 = $.text('Settings');

					$.append($$anchor, text_4);
				},
				$$slots: { default: true }
			});

			var node_7 = $.sibling(node_6, 2);

			Button(node_7, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_5 = $.text('Messages');

					$.append($$anchor, text_5);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.append($$anchor, div);
}