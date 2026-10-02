import * as $ from 'svelte/internal/server';
import { OverflowMenu, OverflowMenuItem } from "carbon-components-svelte";

export default function OverflowMenuPreventDefault($$renderer) {
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

	OverflowMenu($$renderer, {
		size: 'field',
		children: ($$renderer) => {
			OverflowMenuItem($$renderer, { text: copied ? "Copied!" : "Copy page", disabled: copying });
			$$renderer.push(`<!----> `);
			OverflowMenuItem($$renderer, { text: 'Close menu' });
			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}