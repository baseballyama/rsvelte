import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { MenuButton, MenuDivider, MenuItem, MenuItemRadioGroup, Stack } from "carbon-components-svelte";

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <p> </p>`, 1);

export default function MenuButtonRadioGroup($$anchor) {
	let selectedId = "comfortable";

	Stack($$anchor, {
		gap: 5,
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_1();
			var node = $.first_child(fragment_1);

			MenuButton(node, {
				labelText: 'View',
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node_1 = $.first_child(fragment_2);

					MenuItem(node_1, {
						$$events: { click: () => console.log("Reset") },
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('Reset');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});

					var node_2 = $.sibling(node_1, 2);

					MenuDivider(node_2, {});

					var node_3 = $.sibling(node_2, 2);

					MenuItemRadioGroup(node_3, {
						labelText: 'Density',
						get selectedId() {
							return selectedId;
						},

						set selectedId($$value) {
							selectedId = $$value;
						},

						children: ($$anchor, $$slotProps) => {
							var fragment_3 = root();
							var node_4 = $.first_child(fragment_3);

							MenuItem(node_4, { id: 'compact', labelText: 'Compact' });

							var node_5 = $.sibling(node_4, 2);

							MenuItem(node_5, { id: 'comfortable', labelText: 'Comfortable' });

							var node_6 = $.sibling(node_5, 2);

							MenuItem(node_6, { id: 'spacious', labelText: 'Spacious' });
							$.append($$anchor, fragment_3);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			var p = $.sibling(node, 2);
			var text_1 = $.only_child(p);

			$.template_effect(() => $.set_text(text_1, `Density: ${selectedId ?? ''}`));
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}