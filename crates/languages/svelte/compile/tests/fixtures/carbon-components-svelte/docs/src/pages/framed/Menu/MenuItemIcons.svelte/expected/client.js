import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button, Menu, MenuItem } from "carbon-components-svelte";
import Copy from "carbon-icons-svelte/lib/Copy.svelte";
import Cut from "carbon-icons-svelte/lib/Cut.svelte";

var root = $.from_html(`<!> <!>`, 1);

export default function MenuItemIcons($$anchor) {
	let anchor;
	let open = false;
	var fragment = root();
	var node = $.first_child(fragment);

	Button(node, {
		get ref() {
			return anchor;
		},

		set ref($$value) {
			anchor = $$value;
		},
		$$events: { click: () => open = !open },
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Actions');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Menu(node_1, {
		get anchor() {
			return anchor;
		},
		labelText: 'Actions menu',
		get open() {
			return open;
		},

		set open($$value) {
			open = $$value;
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node_2 = $.first_child(fragment_1);

			MenuItem(node_2, {
				get icon() {
					return Cut;
				},
				$$events: { click: () => console.log("Cut") },
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('Cut');

					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});

			var node_3 = $.sibling(node_2, 2);

			MenuItem(node_3, {
				get icon() {
					return Copy;
				},
				$$events: { click: () => console.log("Copy") },
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_2 = $.text('Copy');

					$.append($$anchor, text_2);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}