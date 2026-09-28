import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import DropdownMenuBasic from "./dropdown-menu-basic.svelte";
import DropdownMenuComplex from "./dropdown-menu-complex.svelte";
import DropdownMenuInDialog from "./dropdown-menu-in-dialog.svelte";
import DropdownMenuWithAvatar from "./dropdown-menu-with-avatar.svelte";
import DropdownMenuWithCheckboxesIcons from "./dropdown-menu-with-checkboxes-icons.svelte";
import DropdownMenuWithCheckboxes from "./dropdown-menu-with-checkboxes.svelte";
import DropdownMenuWithDestructive from "./dropdown-menu-with-destructive.svelte";
import DropdownMenuWithIcons from "./dropdown-menu-with-icons.svelte";
import DropdownMenuWithRadioIcons from "./dropdown-menu-with-radio-icons.svelte";
import DropdownMenuWithRadio from "./dropdown-menu-with-radio.svelte";
import DropdownMenuWithShortcuts from "./dropdown-menu-with-shortcuts.svelte";
import DropdownMenuWithSubmenu from "./dropdown-menu-with-submenu.svelte";
import ExampleWrapper from "../../../../../routes/(app)/(layout)/(create)/components/example-wrapper.svelte";

var root = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!>`, 1);

export default function Dropdown_menu($$anchor) {
	ExampleWrapper($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			DropdownMenuBasic(node, {});

			var node_1 = $.sibling(node, 2);

			DropdownMenuComplex(node_1, {});

			var node_2 = $.sibling(node_1, 2);

			DropdownMenuWithIcons(node_2, {});

			var node_3 = $.sibling(node_2, 2);

			DropdownMenuWithShortcuts(node_3, {});

			var node_4 = $.sibling(node_3, 2);

			DropdownMenuWithSubmenu(node_4, {});

			var node_5 = $.sibling(node_4, 2);

			DropdownMenuWithCheckboxes(node_5, {});

			var node_6 = $.sibling(node_5, 2);

			DropdownMenuWithCheckboxesIcons(node_6, {});

			var node_7 = $.sibling(node_6, 2);

			DropdownMenuWithRadio(node_7, {});

			var node_8 = $.sibling(node_7, 2);

			DropdownMenuWithRadioIcons(node_8, {});

			var node_9 = $.sibling(node_8, 2);

			DropdownMenuWithDestructive(node_9, {});

			var node_10 = $.sibling(node_9, 2);

			DropdownMenuWithAvatar(node_10, {});

			var node_11 = $.sibling(node_10, 2);

			DropdownMenuInDialog(node_11, {});
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}