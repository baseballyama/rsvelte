import * as $ from 'svelte/internal/server';
import { TooltipDefinition } from "carbon-components-svelte";

export default function TooltipDefinitionEvents($$renderer) {
	let events = [];

	TooltipDefinition($$renderer, {
		align: 'start',
		tooltipText: 'IBM Corporate Headquarters is based in Armonk, New York.',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Dispatched events: ${$.escape(events.join(", "))}`);
		},
		$$slots: { default: true }
	});
}