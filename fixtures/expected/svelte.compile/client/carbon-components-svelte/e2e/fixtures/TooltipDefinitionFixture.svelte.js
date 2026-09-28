import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { TooltipDefinition } from "carbon-components-svelte";

export default function TooltipDefinitionFixture($$anchor) {
	TooltipDefinition($$anchor, {
		'data-testid': 'tooltip-definition',
		tooltipText: 'Definition tooltip text',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Definition trigger');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});
}