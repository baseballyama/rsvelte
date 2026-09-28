import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { ContextMenu, ContextMenuDivider, ContextMenuOption } from "carbon-components-svelte";
import CopyFile from "carbon-icons-svelte/lib/CopyFile.svelte";
import Cut from "carbon-icons-svelte/lib/Cut.svelte";
import TrashCan from "carbon-icons-svelte/lib/TrashCan.svelte";

var root = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <div data-centered=""><p>Right click anywhere on this page</p></div>`, 1);

export default function ContextMenuOptionProps($$anchor) {
	var fragment = root_1();
	var node = $.first_child(fragment);

	ContextMenu(node, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node_1 = $.first_child(fragment_1);

			ContextMenuOption(node_1, { labelText: 'Plain label' });

			var node_2 = $.sibling(node_1, 2);

			ContextMenuOption(node_2, { labelText: 'With shortcut', shortcutText: '⌘K' });

			var node_3 = $.sibling(node_2, 2);

			ContextMenuOption(node_3, {
				labelText: 'Copy',
				shortcutText: '⌘C',
				get icon() {
					return CopyFile;
				}
			});

			var node_4 = $.sibling(node_3, 2);

			ContextMenuDivider(node_4, {});

			var node_5 = $.sibling(node_4, 2);

			ContextMenuOption(node_5, { indented: true, labelText: 'Indented without icon' });

			var node_6 = $.sibling(node_5, 2);

			ContextMenuDivider(node_6, {});

			var node_7 = $.sibling(node_6, 2);

			ContextMenuOption(node_7, {
				disabled: true,
				labelText: 'Disabled',
				shortcutText: '⌘D',
				get icon() {
					return Cut;
				}
			});

			var node_8 = $.sibling(node_7, 2);

			ContextMenuDivider(node_8, {});

			var node_9 = $.sibling(node_8, 2);

			ContextMenuOption(node_9, {
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