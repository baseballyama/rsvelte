import * as $ from 'svelte/internal/server';
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

export default function Context_menu($$renderer) {
	ExampleWrapper($$renderer, {
		children: ($$renderer) => {
			ContextMenuBasic($$renderer, {});
			$$renderer.push(`<!----> `);
			ContextMenuWithSides($$renderer, {});
			$$renderer.push(`<!----> `);
			ContextMenuWithIcons($$renderer, {});
			$$renderer.push(`<!----> `);
			ContextMenuWithShortcuts($$renderer, {});
			$$renderer.push(`<!----> `);
			ContextMenuWithSubmenu($$renderer, {});
			$$renderer.push(`<!----> `);
			ContextMenuWithGroups($$renderer, {});
			$$renderer.push(`<!----> `);
			ContextMenuWithCheckboxes($$renderer, {});
			$$renderer.push(`<!----> `);
			ContextMenuWithRadio($$renderer, {});
			$$renderer.push(`<!----> `);
			ContextMenuWithDestructive($$renderer, {});
			$$renderer.push(`<!----> `);
			ContextMenuInDialog($$renderer, {});
			$$renderer.push(`<!----> `);
			ContextMenuWithInset($$renderer, {});
			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}