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
import TrashCan from "carbon-icons-svelte/lib/TrashCan.svelte";

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<!> <div data-centered=""><p data-outline="">Right click this element</p></div>`, 1);

export default function ContextMenuTarget($$anchor) {
	let target;
	var fragment = root_2();
	var node = $.first_child(fragment);

	ContextMenu(node, {
		get target() {
			return target;
		},
		$$events: { open: (e) => console.log(e.detail) },
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_1();
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
				labelText: 'Export as',
				children: ($$anchor, $$slotProps) => {
					ContextMenuGroup($$anchor, {
						labelText: 'Export options',
						children: ($$anchor, $$slotProps) => {
							var fragment_3 = root();
							var node_5 = $.first_child(fragment_3);

							ContextMenuOption(node_5, { id: 'pdf', labelText: 'PDF' });

							var node_6 = $.sibling(node_5, 2);

							ContextMenuOption(node_6, { id: 'txt', labelText: 'TXT' });

							var node_7 = $.sibling(node_6, 2);

							ContextMenuOption(node_7, { id: 'mp3', labelText: 'MP3' });
							$.append($$anchor, fragment_3);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			var node_8 = $.sibling(node_4, 2);

			ContextMenuDivider(node_8, {});

			var node_9 = $.sibling(node_8, 2);

			ContextMenuOption(node_9, { selectable: true, labelText: 'Remove metadata' });

			var node_10 = $.sibling(node_9, 2);

			ContextMenuDivider(node_10, {});

			var node_11 = $.sibling(node_10, 2);

			ContextMenuGroup(node_11, {
				labelText: 'Style options',
				children: ($$anchor, $$slotProps) => {
					var fragment_4 = root();
					var node_12 = $.first_child(fragment_4);

					ContextMenuOption(node_12, { id: '0', labelText: 'Font smoothing', selected: true });

					var node_13 = $.sibling(node_12, 2);

					ContextMenuOption(node_13, { id: '1', labelText: 'Reduce noise' });

					var node_14 = $.sibling(node_13, 2);

					ContextMenuOption(node_14, { id: '2', labelText: 'Auto-sharpen' });
					$.append($$anchor, fragment_4);
				},
				$$slots: { default: true }
			});

			var node_15 = $.sibling(node_11, 2);

			ContextMenuDivider(node_15, {});

			var node_16 = $.sibling(node_15, 2);

			ContextMenuOption(node_16, {
				kind: 'danger',
				labelText: 'Delete',
				get icon() {
					return TrashCan;
				}
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var div = $.sibling(node, 2);
	var p = $.child(div);

	$.bind_this(p, ($$value) => target = $$value, () => target);
	$.reset(div);
	$.append($$anchor, fragment);
}