import * as $ from 'svelte/internal/server';
import { CopyButton, Stack } from "carbon-components-svelte";

export default function CopyButtonPortalTooltip($$renderer) {
	Stack($$renderer, {
		gap: 4,
		style: 'overflow: hidden; border: 1px dashed var(--cds-border-subtle); padding: 1rem; max-height: 120px;',
		children: ($$renderer) => {
			CopyButton($$renderer, {
				text: 'Carbon svelte',
				feedback: 'Portalled (default)',
				tooltipAlignment: 'start'
			});

			$$renderer.push(`<!----> `);

			CopyButton($$renderer, {
				text: 'Carbon svelte',
				feedback: 'Inline caret',
				portalTooltip: false,
				tooltipAlignment: 'start'
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}