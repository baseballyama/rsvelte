import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import ContextMenu from "carbon-components-svelte/ContextMenu/ContextMenu.svelte";
import ContextMenuOption from "carbon-components-svelte/ContextMenu/ContextMenuOption.svelte";

var root = $.from_html(`<span slot="labelChildren">Custom label content</span>`);

export default function ContextMenuOption_slot_test($$anchor) {
	ContextMenu($$anchor, {
		open: true,
		x: 0,
		y: 0,
		children: ($$anchor, $$slotProps) => {
			ContextMenuOption($$anchor, {
				labelText: 'Default label',
				$$slots: {
					labelChildren: ($$anchor, $$slotProps) => {
						var span = root();

						$.append($$anchor, span);
					}
				}
			});
		},
		$$slots: { default: true }
	});
}