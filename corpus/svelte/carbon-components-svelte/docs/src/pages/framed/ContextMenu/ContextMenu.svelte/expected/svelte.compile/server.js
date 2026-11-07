import * as $ from 'svelte/internal/server';
import { ContextMenu, ContextMenuDivider, ContextMenuOption } from "carbon-components-svelte";
import CopyFile from "carbon-icons-svelte/lib/CopyFile.svelte";
import Cut from "carbon-icons-svelte/lib/Cut.svelte";
import TrashCan from "carbon-icons-svelte/lib/TrashCan.svelte";

export default function ContextMenu_1($$renderer) {
	ContextMenu($$renderer, {
		labelText: 'Menu actions',
		children: ($$renderer) => {
			ContextMenuOption($$renderer, { labelText: 'Copy', shortcutText: '⌘C', icon: CopyFile });
			$$renderer.push(`<!----> `);
			ContextMenuOption($$renderer, { labelText: 'Cut', shortcutText: '⌘X', icon: Cut });
			$$renderer.push(`<!----> `);
			ContextMenuDivider($$renderer, {});
			$$renderer.push(`<!----> `);
			ContextMenuOption($$renderer, { kind: 'danger', labelText: 'Delete', icon: TrashCan });
			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <div data-centered=""><p>Right click anywhere on this page</p></div>`);
}