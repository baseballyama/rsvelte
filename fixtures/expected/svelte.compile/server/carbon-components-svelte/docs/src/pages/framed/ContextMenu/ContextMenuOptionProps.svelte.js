import * as $ from 'svelte/internal/server';
import { ContextMenu, ContextMenuDivider, ContextMenuOption } from "carbon-components-svelte";
import CopyFile from "carbon-icons-svelte/lib/CopyFile.svelte";
import Cut from "carbon-icons-svelte/lib/Cut.svelte";
import TrashCan from "carbon-icons-svelte/lib/TrashCan.svelte";

export default function ContextMenuOptionProps($$renderer) {
	ContextMenu($$renderer, {
		children: ($$renderer) => {
			ContextMenuOption($$renderer, { labelText: 'Plain label' });
			$$renderer.push(`<!----> `);
			ContextMenuOption($$renderer, { labelText: 'With shortcut', shortcutText: '⌘K' });
			$$renderer.push(`<!----> `);
			ContextMenuOption($$renderer, { labelText: 'Copy', shortcutText: '⌘C', icon: CopyFile });
			$$renderer.push(`<!----> `);
			ContextMenuDivider($$renderer, {});
			$$renderer.push(`<!----> `);
			ContextMenuOption($$renderer, { indented: true, labelText: 'Indented without icon' });
			$$renderer.push(`<!----> `);
			ContextMenuDivider($$renderer, {});
			$$renderer.push(`<!----> `);

			ContextMenuOption($$renderer, {
				disabled: true,
				labelText: 'Disabled',
				shortcutText: '⌘D',
				icon: Cut
			});

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