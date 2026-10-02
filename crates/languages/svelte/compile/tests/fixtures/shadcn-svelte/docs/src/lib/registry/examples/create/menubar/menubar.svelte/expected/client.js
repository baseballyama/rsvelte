import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import MenubarBasic from "./menubar-basic.svelte";
import MenubarDestructive from "./menubar-destructive.svelte";
import MenubarFormat from "./menubar-format.svelte";
import MenubarInDialog from "./menubar-in-dialog.svelte";
import MenubarInsert from "./menubar-insert.svelte";
import MenubarWithCheckboxes from "./menubar-with-checkboxes.svelte";
import MenubarWithIcons from "./menubar-with-icons.svelte";
import MenubarWithInset from "./menubar-with-inset.svelte";
import MenubarWithRadio from "./menubar-with-radio.svelte";
import MenubarWithShortcuts from "./menubar-with-shortcuts.svelte";
import MenubarWithSubmenu from "./menubar-with-submenu.svelte";
import ExampleWrapper from "../../../../../routes/(app)/(layout)/(create)/components/example-wrapper.svelte";

var root = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!>`, 1);

export default function Menubar($$anchor) {
	ExampleWrapper($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			MenubarBasic(node, {});

			var node_1 = $.sibling(node, 2);

			MenubarWithSubmenu(node_1, {});

			var node_2 = $.sibling(node_1, 2);

			MenubarWithCheckboxes(node_2, {});

			var node_3 = $.sibling(node_2, 2);

			MenubarWithRadio(node_3, {});

			var node_4 = $.sibling(node_3, 2);

			MenubarWithIcons(node_4, {});

			var node_5 = $.sibling(node_4, 2);

			MenubarWithShortcuts(node_5, {});

			var node_6 = $.sibling(node_5, 2);

			MenubarFormat(node_6, {});

			var node_7 = $.sibling(node_6, 2);

			MenubarInsert(node_7, {});

			var node_8 = $.sibling(node_7, 2);

			MenubarDestructive(node_8, {});

			var node_9 = $.sibling(node_8, 2);

			MenubarInDialog(node_9, {});

			var node_10 = $.sibling(node_9, 2);

			MenubarWithInset(node_10, {});
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}