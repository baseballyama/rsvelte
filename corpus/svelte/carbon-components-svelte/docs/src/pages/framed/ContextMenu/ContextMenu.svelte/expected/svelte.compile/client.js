import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { ContextMenu, ContextMenuDivider, ContextMenuOption } from "carbon-components-svelte";
import CopyFile from "carbon-icons-svelte/lib/CopyFile.svelte";
import Cut from "carbon-icons-svelte/lib/Cut.svelte";
import TrashCan from "carbon-icons-svelte/lib/TrashCan.svelte";

var root = $.from_html(`<!> <!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <div data-centered=""><p>Right click anywhere on this page</p></div>`, 1);

export default function ContextMenu_1($$anchor) {
	var fragment = root_1();
	var node = $.first_child(fragment);

	ContextMenu(node, {
		labelText: 'Menu actions',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
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

	$.next(2);
	$.append($$anchor, fragment);
}