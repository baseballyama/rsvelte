import * as $ from 'svelte/internal/server';

import {
	ContextMenu,
	ContextMenuDivider,
	ContextMenuGroup,
	ContextMenuOption
} from "carbon-components-svelte";

import CopyFile from "carbon-icons-svelte/lib/CopyFile.svelte";
import Cut from "carbon-icons-svelte/lib/Cut.svelte";
import TrashCan from "carbon-icons-svelte/lib/TrashCan.svelte";

export default function ContextMenuTarget($$renderer) {
	let target;

	ContextMenu($$renderer, {
		target,
		children: ($$renderer) => {
			ContextMenuOption($$renderer, { labelText: 'Copy', shortcutText: '⌘C', icon: CopyFile });
			$$renderer.push(`<!----> `);
			ContextMenuOption($$renderer, { labelText: 'Cut', shortcutText: '⌘X', icon: Cut });
			$$renderer.push(`<!----> `);
			ContextMenuDivider($$renderer, {});
			$$renderer.push(`<!----> `);

			ContextMenuOption($$renderer, {
				indented: true,
				labelText: 'Export as',
				children: ($$renderer) => {
					ContextMenuGroup($$renderer, {
						labelText: 'Export options',
						children: ($$renderer) => {
							ContextMenuOption($$renderer, { id: 'pdf', labelText: 'PDF' });
							$$renderer.push(`<!----> `);
							ContextMenuOption($$renderer, { id: 'txt', labelText: 'TXT' });
							$$renderer.push(`<!----> `);
							ContextMenuOption($$renderer, { id: 'mp3', labelText: 'MP3' });
							$$renderer.push(`<!---->`);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);
			ContextMenuDivider($$renderer, {});
			$$renderer.push(`<!----> `);
			ContextMenuOption($$renderer, { selectable: true, labelText: 'Remove metadata' });
			$$renderer.push(`<!----> `);
			ContextMenuDivider($$renderer, {});
			$$renderer.push(`<!----> `);

			ContextMenuGroup($$renderer, {
				labelText: 'Style options',
				children: ($$renderer) => {
					ContextMenuOption($$renderer, { id: '0', labelText: 'Font smoothing', selected: true });
					$$renderer.push(`<!----> `);
					ContextMenuOption($$renderer, { id: '1', labelText: 'Reduce noise' });
					$$renderer.push(`<!----> `);
					ContextMenuOption($$renderer, { id: '2', labelText: 'Auto-sharpen' });
					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);
			ContextMenuDivider($$renderer, {});
			$$renderer.push(`<!----> `);
			ContextMenuOption($$renderer, { kind: 'danger', labelText: 'Delete', icon: TrashCan });
			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <div data-centered=""><p data-outline="">Right click this element</p></div>`);
}