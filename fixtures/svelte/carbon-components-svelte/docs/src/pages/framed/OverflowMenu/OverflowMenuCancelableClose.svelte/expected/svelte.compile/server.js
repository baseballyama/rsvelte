import * as $ from 'svelte/internal/server';
import { OverflowMenu, OverflowMenuItem } from "carbon-components-svelte";

export default function OverflowMenuCancelableClose($$renderer) {
	let emailEnabled = false;
	let smsEnabled = false;
	let saved = true;

	function toggle(setter) {
		return (e) => {
			// Keep the menu open while editing settings.
			e.preventDefault();

			setter();
			saved = false;
		};
	}

	OverflowMenu($$renderer, {
		children: ($$renderer) => {
			OverflowMenuItem($$renderer, { text: `Email alerts: ${emailEnabled ? 'On' : 'Off'}` });
			$$renderer.push(`<!----> `);
			OverflowMenuItem($$renderer, { text: `SMS alerts: ${smsEnabled ? 'On' : 'Off'}` });
			$$renderer.push(`<!----> `);
			OverflowMenuItem($$renderer, { hasDivider: true, text: 'Save changes' });
			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}