import * as $ from 'svelte/internal/server';
import { CopyInput, Stack } from "carbon-components-svelte";

export default function CopyInputPortalTooltip($$renderer) {
	Stack($$renderer, {
		gap: 4,
		style: 'overflow: hidden; border: 1px dashed var(--cds-border-subtle); padding: 1rem; max-height: 160px;',
		children: ($$renderer) => {
			CopyInput($$renderer, {
				labelText: 'Portalled (default)',
				value: 'sk-1234567890abcdef'
			});

			$$renderer.push(`<!----> `);

			CopyInput($$renderer, {
				labelText: 'Inline caret',
				value: 'sk-1234567890abcdef',
				portalTooltip: false
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}