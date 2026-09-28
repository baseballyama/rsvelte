import * as $ from 'svelte/internal/server';
import { TooltipDefinition } from "carbon-components-svelte";

export default function TooltipDefinitionFixture($$renderer) {
	TooltipDefinition($$renderer, {
		'data-testid': 'tooltip-definition',
		tooltipText: 'Definition tooltip text',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Definition trigger`);
		},
		$$slots: { default: true }
	});
}