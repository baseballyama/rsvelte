import * as $ from 'svelte/internal/server';
import { MultiSelect, Stack } from "carbon-components-svelte";

export default function MultiSelectPortalMenu($$renderer) {
	Stack($$renderer, {
		gap: 4,
		style: 'overflow: hidden; border: 1px dashed var(--cds-border-subtle); padding: 1rem; max-height: 120px;',
		children: ($$renderer) => {
			$$renderer.push(`<div>This container has hidden overflow. Without <code>portalMenu</code>, the
    dropdown would be clipped.</div> `);

			MultiSelect($$renderer, {
				portalMenu: true,
				labelText: 'Notification methods',
				label: 'Select methods...',
				items: [
					{ id: "0", text: "Slack" },
					{ id: "1", text: "Email" },
					{ id: "2", text: "Fax" }
				]
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}