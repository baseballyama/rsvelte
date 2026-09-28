import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Menu from "carbon-components-svelte/Menu/Menu.svelte";
import MenuItem from "carbon-components-svelte/Menu/MenuItem.svelte";

var root = $.from_html(`<kbd>⌘S</kbd>`);
var root_1 = $.from_html(`<strong>Custom label content</strong>`);
var root_2 = $.from_html(`<!> <!>`, 1);
var root_3 = $.from_html(`<button type="button">Trigger</button> <!>`, 1);

export default function MenuItem_slot_test($$anchor) {
	let anchor;
	let open = false;
	var fragment = root_3();
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
			var fragment_1 = root_2();
			var node_1 = $.first_child(fragment_1);

			MenuItem(node_1, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Save');

					$.append($$anchor, text);
				},

				$$slots: {
					default: true,
					shortcutText: ($$anchor, $$slotProps) => {
						var kbd = root();

						$.append($$anchor, kbd);
					}
				}
			});

			var node_2 = $.sibling(node_1, 2);

			MenuItem(node_2, {
				labelText: 'Export as',
				children: ($$anchor, $$slotProps) => {
					MenuItem($$anchor, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text('PDF');

							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});
				},

				$$slots: {
					default: true,
					labelChildren: ($$anchor, $$slotProps) => {
						var strong = root_1();

						$.append($$anchor, strong);
					}
				}
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.event('click', button, () => open = !open);
	$.append($$anchor, fragment);
}