import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import ContextMenuBasic from "./context-menu-basic.svelte";
import ContextMenuInDialog from "./context-menu-in-dialog.svelte";
import ContextMenuWithCheckboxes from "./context-menu-with-checkboxes.svelte";
import ContextMenuWithDestructive from "./context-menu-with-destructive.svelte";
import ContextMenuWithGroups from "./context-menu-with-groups.svelte";
import ContextMenuWithIcons from "./context-menu-with-icons.svelte";
import ContextMenuWithInset from "./context-menu-with-inset.svelte";
import ContextMenuWithRadio from "./context-menu-with-radio.svelte";
import ContextMenuWithShortcuts from "./context-menu-with-shortcuts.svelte";
import ContextMenuWithSides from "./context-menu-with-sides.svelte";
import ContextMenuWithSubmenu from "./context-menu-with-submenu.svelte";
import ExampleWrapper from "../../../../../routes/(app)/(layout)/(create)/components/example-wrapper.svelte";

var root = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!>`, 1);

export default function Context_menu($$anchor) {
	ExampleWrapper($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			ContextMenuBasic(node, {});

			var node_1 = $.sibling(node, 2);

			ContextMenuWithSides(node_1, {});

			var node_2 = $.sibling(node_1, 2);

			ContextMenuWithIcons(node_2, {});

			var node_3 = $.sibling(node_2, 2);

			ContextMenuWithShortcuts(node_3, {});

			var node_4 = $.sibling(node_3, 2);

			ContextMenuWithSubmenu(node_4, {});

			var node_5 = $.sibling(node_4, 2);

			ContextMenuWithGroups(node_5, {});

			var node_6 = $.sibling(node_5, 2);

			ContextMenuWithCheckboxes(node_6, {});

			var node_7 = $.sibling(node_6, 2);

			ContextMenuWithRadio(node_7, {});

			var node_8 = $.sibling(node_7, 2);

			ContextMenuWithDestructive(node_8, {});

			var node_9 = $.sibling(node_8, 2);

			ContextMenuInDialog(node_9, {});

			var node_10 = $.sibling(node_9, 2);

			ContextMenuWithInset(node_10, {});
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}