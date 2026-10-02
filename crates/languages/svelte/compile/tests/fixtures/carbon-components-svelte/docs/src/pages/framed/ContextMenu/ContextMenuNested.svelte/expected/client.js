import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

import {
	ContextMenu,
	ContextMenuDivider,
	ContextMenuGroup,
	ContextMenuOption
} from "carbon-components-svelte";

import CopyFile from "carbon-icons-svelte/lib/CopyFile.svelte";
import Cut from "carbon-icons-svelte/lib/Cut.svelte";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);
var root_2 = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!>`, 1);
var root_3 = $.from_html(`<!> <div data-centered=""><p>Right click anywhere on this page</p></div>`, 1);

export default function ContextMenuNested($$anchor) {
	let selectedIds = [];
	var fragment = root_3();
	var node = $.first_child(fragment);

	ContextMenu(node, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_2();
			var node_1 = $.first_child(fragment_1);

			ContextMenuOption(node_1, {
				labelText: 'Copy',
				shortcutText: '⌘C',
				get icon() {
					return CopyFile;
				}
			});

			var node_2 = $.sibling(node_1, 2);

			ContextMenuOption(node_2, {
				labelText: 'Cut',
				shortcutText: '⌘X',
				get icon() {
					return Cut;
				}
			});

			var node_3 = $.sibling(node_2, 2);

			ContextMenuDivider(node_3, {});

			var node_4 = $.sibling(node_3, 2);

			ContextMenuOption(node_4, {
				indented: true,
				labelText: 'Open with',
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node_5 = $.first_child(fragment_2);

					ContextMenuOption(node_5, { labelText: 'Preview' });

					var node_6 = $.sibling(node_5, 2);

					ContextMenuOption(node_6, { labelText: 'Editor' });
					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			var node_7 = $.sibling(node_4, 2);

			ContextMenuDivider(node_7, {});

			var node_8 = $.sibling(node_7, 2);

			ContextMenuOption(node_8, {
				indented: true,
				labelText: 'Export as',
				children: ($$anchor, $$slotProps) => {
					ContextMenuGroup($$anchor, {
						labelText: 'Export formats',
						get selectedIds() {
							return selectedIds;
						},

						set selectedIds($$value) {
							selectedIds = $$value;
						},

						children: ($$anchor, $$slotProps) => {
							var fragment_4 = root_1();
							var node_9 = $.first_child(fragment_4);

							ContextMenuOption(node_9, { id: 'pdf', labelText: 'PDF' });

							var node_10 = $.sibling(node_9, 2);

							ContextMenuOption(node_10, { id: 'svg', labelText: 'SVG' });

							var node_11 = $.sibling(node_10, 2);

							ContextMenuOption(node_11, { id: 'png', labelText: 'PNG' });
							$.append($$anchor, fragment_4);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			var node_12 = $.sibling(node_8, 2);

			ContextMenuDivider(node_12, {});

			var node_13 = $.sibling(node_12, 2);

			ContextMenuOption(node_13, {
				disabled: true,
				indented: true,
				labelText: 'Share',
				children: ($$anchor, $$slotProps) => {
					var fragment_5 = root();
					var node_14 = $.first_child(fragment_5);

					ContextMenuOption(node_14, { labelText: 'Email link' });

					var node_15 = $.sibling(node_14, 2);

					ContextMenuOption(node_15, { labelText: 'Copy link' });
					$.append($$anchor, fragment_5);
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