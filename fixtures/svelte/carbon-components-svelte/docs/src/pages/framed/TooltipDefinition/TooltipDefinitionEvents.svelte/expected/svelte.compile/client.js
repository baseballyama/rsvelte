import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { TooltipDefinition } from "carbon-components-svelte";

export default function TooltipDefinitionEvents($$anchor) {
	let events = [];

	TooltipDefinition($$anchor, {
		align: 'start',
		tooltipText: 'IBM Corporate Headquarters is based in Armonk, New York.',
		$$events: {
			open: () => events = [...events, "open"],
			close: () => events = [...events, "close"]
		},

		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text();

			$.template_effect(($0) => $.set_text(text, `Dispatched events: ${$0 ?? ''}`), [() => events.join(", ")]);
			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});
}