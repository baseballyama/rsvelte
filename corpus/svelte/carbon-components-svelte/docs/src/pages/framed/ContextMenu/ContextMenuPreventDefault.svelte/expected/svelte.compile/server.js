import * as $ from 'svelte/internal/server';
import { ContextMenu, ContextMenuDivider, ContextMenuOption } from "carbon-components-svelte";
import Checkmark from "carbon-icons-svelte/lib/Checkmark.svelte";
import Copy from "carbon-icons-svelte/lib/Copy.svelte";
import TrashCan from "carbon-icons-svelte/lib/TrashCan.svelte";

export default function ContextMenuPreventDefault($$renderer) {
	let copying = false;
	let copied = false;

	async function copyToClipboard() {
		if (copying) return;

		copying = true;
		copied = false;
		await navigator.clipboard.writeText("Sample text to copy");
		copied = true;

		setTimeout(
			() => {
				copied = false;
			},
			2000
		);

		copying = false;
	}

	ContextMenu($$renderer, {
		children: ($$renderer) => {
			ContextMenuOption($$renderer, {
				indented: true,
				labelText: copied ? "Copied!" : "Copy text",
				icon: copied ? Checkmark : Copy,
				disabled: copying
			});

			$$renderer.push(`<!----> `);
			ContextMenuDivider($$renderer, {});
			$$renderer.push(`<!----> `);
			ContextMenuOption($$renderer, { kind: 'danger', labelText: 'Delete item', icon: TrashCan });
			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <div data-centered=""><p>Right click anywhere on this page</p></div>`);
}