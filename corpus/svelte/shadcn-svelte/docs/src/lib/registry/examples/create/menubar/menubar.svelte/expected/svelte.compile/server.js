import * as $ from 'svelte/internal/server';
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

export default function Menubar($$renderer) {
	ExampleWrapper($$renderer, {
		children: ($$renderer) => {
			MenubarBasic($$renderer, {});
			$$renderer.push(`<!----> `);
			MenubarWithSubmenu($$renderer, {});
			$$renderer.push(`<!----> `);
			MenubarWithCheckboxes($$renderer, {});
			$$renderer.push(`<!----> `);
			MenubarWithRadio($$renderer, {});
			$$renderer.push(`<!----> `);
			MenubarWithIcons($$renderer, {});
			$$renderer.push(`<!----> `);
			MenubarWithShortcuts($$renderer, {});
			$$renderer.push(`<!----> `);
			MenubarFormat($$renderer, {});
			$$renderer.push(`<!----> `);
			MenubarInsert($$renderer, {});
			$$renderer.push(`<!----> `);
			MenubarDestructive($$renderer, {});
			$$renderer.push(`<!----> `);
			MenubarInDialog($$renderer, {});
			$$renderer.push(`<!----> `);
			MenubarWithInset($$renderer, {});
			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}