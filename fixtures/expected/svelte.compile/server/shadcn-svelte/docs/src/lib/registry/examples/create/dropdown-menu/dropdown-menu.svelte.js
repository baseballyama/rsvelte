import * as $ from 'svelte/internal/server';
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

export default function Dropdown_menu($$renderer) {
	ExampleWrapper($$renderer, {
		children: ($$renderer) => {
			DropdownMenuBasic($$renderer, {});
			$$renderer.push(`<!----> `);
			DropdownMenuComplex($$renderer, {});
			$$renderer.push(`<!----> `);
			DropdownMenuWithIcons($$renderer, {});
			$$renderer.push(`<!----> `);
			DropdownMenuWithShortcuts($$renderer, {});
			$$renderer.push(`<!----> `);
			DropdownMenuWithSubmenu($$renderer, {});
			$$renderer.push(`<!----> `);
			DropdownMenuWithCheckboxes($$renderer, {});
			$$renderer.push(`<!----> `);
			DropdownMenuWithCheckboxesIcons($$renderer, {});
			$$renderer.push(`<!----> `);
			DropdownMenuWithRadio($$renderer, {});
			$$renderer.push(`<!----> `);
			DropdownMenuWithRadioIcons($$renderer, {});
			$$renderer.push(`<!----> `);
			DropdownMenuWithDestructive($$renderer, {});
			$$renderer.push(`<!----> `);
			DropdownMenuWithAvatar($$renderer, {});
			$$renderer.push(`<!----> `);
			DropdownMenuInDialog($$renderer, {});
			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}