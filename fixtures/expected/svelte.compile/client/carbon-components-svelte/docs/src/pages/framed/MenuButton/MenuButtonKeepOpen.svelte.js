import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

import {
	MenuButton,
	MenuDivider,
	MenuItem,
	MenuItemGroup,
	MenuItemRadioGroup,
	Stack
} from "carbon-components-svelte";

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<!> <p> </p> <p> </p>`, 1);

export default function MenuButtonKeepOpen($$anchor) {
	let selectedIds = ["name"];
	let theme = "light";

	Stack($$anchor, {
		gap: 5,
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_2();
			var node = $.first_child(fragment_1);

			MenuButton(node, {
				labelText: 'View',
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node_1 = $.first_child(fragment_2);

					MenuItemGroup(node_1, {
						labelText: 'Columns',
						get selectedIds() {
							return selectedIds;
						},

						set selectedIds($$value) {
							selectedIds = $$value;
						},

						children: ($$anchor, $$slotProps) => {
							var fragment_3 = root();
							var node_2 = $.first_child(fragment_3);

							MenuItem(node_2, {
								id: 'name',
								labelText: 'Name',
								$$events: { click: (e) => e.preventDefault() }
							});

							var node_3 = $.sibling(node_2, 2);

							MenuItem(node_3, {
								id: 'size',
								labelText: 'Size',
								$$events: { click: (e) => e.preventDefault() }
							});

							var node_4 = $.sibling(node_3, 2);

							MenuItem(node_4, {
								id: 'modified',
								labelText: 'Last modified',
								$$events: { click: (e) => e.preventDefault() }
							});

							$.append($$anchor, fragment_3);
						},
						$$slots: { default: true }
					});

					var node_5 = $.sibling(node_1, 2);

					MenuDivider(node_5, {});

					var node_6 = $.sibling(node_5, 2);

					MenuItem(node_6, {
						labelText: 'Theme',
						children: ($$anchor, $$slotProps) => {
							MenuItemRadioGroup($$anchor, {
								get selectedId() {
									return theme;
								},

								set selectedId($$value) {
									theme = $$value;
								},

								children: ($$anchor, $$slotProps) => {
									var fragment_5 = root_1();
									var node_7 = $.first_child(fragment_5);

									MenuItem(node_7, {
										id: 'light',
										labelText: 'Light',
										$$events: { click: (e) => e.preventDefault() }
									});

									var node_8 = $.sibling(node_7, 2);

									MenuItem(node_8, {
										id: 'dark',
										labelText: 'Dark',
										$$events: { click: (e) => e.preventDefault() }
									});

									$.append($$anchor, fragment_5);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			var p = $.sibling(node, 2);
			var text = $.only_child(p);
			var p_1 = $.sibling(p, 2);
			var text_1 = $.only_child(p_1);

			$.template_effect(
				($0) => {
					$.set_text(text, `Visible columns: ${$0 ?? ''}`);
					$.set_text(text_1, `Theme: ${theme ?? ''}`);
				},
				[() => selectedIds.join(", ") || "None"]
			);

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}