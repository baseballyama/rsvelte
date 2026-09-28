import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button, Menu, MenuItem } from "carbon-components-svelte";

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function MenuItemNested($$anchor) {
	let anchor;
	let open = false;
	var fragment = root_1();
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
				$$events: { click: () => console.log("Copy") },
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_2 = $.text('Copy');

					$.append($$anchor, text_2);
				},
				$$slots: { default: true }
			});

			var node_4 = $.sibling(node_3, 2);

			MenuItem(node_4, {
				labelText: 'Export as',
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node_5 = $.first_child(fragment_2);

					MenuItem(node_5, {
						$$events: { click: () => console.log("PDF") },
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_3 = $.text('PDF');

							$.append($$anchor, text_3);
						},
						$$slots: { default: true }
					});

					var node_6 = $.sibling(node_5, 2);

					MenuItem(node_6, {
						$$events: { click: () => console.log("JPG") },
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_4 = $.text('JPG');

							$.append($$anchor, text_4);
						},
						$$slots: { default: true }
					});

					var node_7 = $.sibling(node_6, 2);

					MenuItem(node_7, {
						$$events: { click: () => console.log("PNG") },
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_5 = $.text('PNG');

							$.append($$anchor, text_5);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}