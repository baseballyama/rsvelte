import * as $ from 'svelte/internal/server';
import ContextMenu from "carbon-components-svelte/ContextMenu/ContextMenu.svelte";
import ContextMenuOption from "carbon-components-svelte/ContextMenu/ContextMenuOption.svelte";

export default function ContextMenuOption_slot_test($$renderer) {
	ContextMenu($$renderer, {
		open: true,
		x: 0,
		y: 0,
		children: ($$renderer) => {
			ContextMenuOption($$renderer, {
				labelText: 'Default label',
				$$slots: {
					labelChildren: ($$renderer) => {
						$$renderer.push(`<span slot="labelChildren">Custom label content</span>`);
					}
				}
			});
		},
		$$slots: { default: true }
	});
}