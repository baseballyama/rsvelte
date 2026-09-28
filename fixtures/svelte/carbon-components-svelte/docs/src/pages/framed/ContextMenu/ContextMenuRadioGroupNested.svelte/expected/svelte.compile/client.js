import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

import {
	ContextMenu,
	ContextMenuDivider,
	ContextMenuOption,
	ContextMenuRadioGroup
} from "carbon-components-svelte";

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <div data-centered=""><p>Right click anywhere on this page</p></div>`, 1);

export default function ContextMenuRadioGroupNested($$anchor) {
	let selectedId = "list";
	var fragment = root_1();
	var node = $.first_child(fragment);

	ContextMenu(node, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node_1 = $.first_child(fragment_1);

			ContextMenuOption(node_1, { labelText: 'Open' });

			var node_2 = $.sibling(node_1, 2);

			ContextMenuDivider(node_2, {});

			var node_3 = $.sibling(node_2, 2);

			ContextMenuOption(node_3, {
				labelText: 'View as',
				children: ($$anchor, $$slotProps) => {
					ContextMenuRadioGroup($$anchor, {
						labelText: 'View mode',
						get selectedId() {
							return selectedId;
						},

						set selectedId($$value) {
							selectedId = $$value;
						},

						children: ($$anchor, $$slotProps) => {
							var fragment_3 = root();
							var node_4 = $.first_child(fragment_3);

							ContextMenuOption(node_4, {
								id: 'list',
								labelText: 'List',
								$$events: { click: (e) => e.preventDefault() }
							});

							var node_5 = $.sibling(node_4, 2);

							ContextMenuOption(node_5, {
								id: 'grid',
								labelText: 'Grid',
								$$events: { click: (e) => e.preventDefault() }
							});

							var node_6 = $.sibling(node_5, 2);

							ContextMenuOption(node_6, {
								id: 'compact',
								labelText: 'Compact',
								$$events: { click: (e) => e.preventDefault() }
							});

							$.append($$anchor, fragment_3);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.next(2);
	$.append($$anchor, fragment);
}