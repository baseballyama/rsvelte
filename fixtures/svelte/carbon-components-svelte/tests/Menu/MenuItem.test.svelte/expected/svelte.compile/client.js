import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Menu from "carbon-components-svelte/Menu/Menu.svelte";
import MenuDivider from "carbon-components-svelte/Menu/MenuDivider.svelte";
import MenuItem from "carbon-components-svelte/Menu/MenuItem.svelte";
import Add from "carbon-icons-svelte/lib/Add.svelte";

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<button type="button">Trigger</button> <!>`, 1);

export default function MenuItem_test($$anchor) {
	let anchor;
	let open = false;
	var fragment = root_2();
	var button = $.first_child(fragment);

	$.bind_this(button, ($$value) => anchor = $$value, () => anchor);

	var node = $.sibling(button, 2);

	Menu(node, {
		get anchor() {
			return anchor;
		},
		labelText: 'Example menu',
		get open() {
			return open;
		},

		set open($$value) {
			open = $$value;
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_1();
			var node_1 = $.first_child(fragment_1);

			MenuItem(node_1, {
				get icon() {
					return Add;
				},

				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Add item');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			var node_2 = $.sibling(node_1, 2);

			MenuItem(node_2, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('Plain');

					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});

			var node_3 = $.sibling(node_2, 2);

			MenuItem(node_3, { labelText: 'Standalone label' });

			var node_4 = $.sibling(node_3, 2);

			MenuItem(node_4, {
				shortcutText: '⌘S',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_2 = $.text('Save');

					$.append($$anchor, text_2);
				},
				$$slots: { default: true }
			});

			var node_5 = $.sibling(node_4, 2);

			MenuItem(node_5, {
				labelText: 'Export as',
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node_6 = $.first_child(fragment_2);

					MenuItem(node_6, {
						$$events: { click: () => console.log("select", "PDF") },
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_3 = $.text('PDF');

							$.append($$anchor, text_3);
						},
						$$slots: { default: true }
					});

					var node_7 = $.sibling(node_6, 2);

					MenuItem(node_7, {
						$$events: { click: () => console.log("select", "JPG") },
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_4 = $.text('JPG');

							$.append($$anchor, text_4);
						},
						$$slots: { default: true }
					});

					var node_8 = $.sibling(node_7, 2);

					MenuItem(node_8, {
						disabled: true,
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

			var node_9 = $.sibling(node_5, 2);

			MenuDivider(node_9, {});

			var node_10 = $.sibling(node_9, 2);

			MenuItem(node_10, {
				kind: 'danger',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_6 = $.text('Delete');

					$.append($$anchor, text_6);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.event('click', button, () => open = !open);
	$.append($$anchor, fragment);
}