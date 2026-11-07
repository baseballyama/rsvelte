import * as $ from 'svelte/internal/server';
import { TooltipIcon } from "carbon-components-svelte";
import Information from "carbon-icons-svelte/lib/Information.svelte";

export default function TooltipIconReactiveFixture($$renderer) {
	let controlledOpen = false;
	let openEvents = 0;
	let closeEvents = 0;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<div data-testid="controlled-block"><button type="button" data-testid="toggle-controlled">Toggle controlled</button> `);

		TooltipIcon($$renderer, {
			'data-testid': 'tooltip-controlled',
			tooltipText: 'Controlled tooltip',
			icon: Information,
			portalTooltip: false,
			get open() {
				return controlledOpen;
			},

			set open($$value) {
				controlledOpen = $$value;
				$$settled = false;
			}
		});

		$$renderer.push(`<!----> <span data-testid="open-event-count">${$.escape(openEvents)}</span> <span data-testid="close-event-count">${$.escape(closeEvents)}</span></div> <div data-testid="pair-row">`);

		TooltipIcon($$renderer, {
			'data-testid': 'tooltip-a',
			tooltipText: 'Tooltip A text',
			icon: Information,
			portalTooltip: false
		});

		$$renderer.push(`<!----> `);

		TooltipIcon($$renderer, {
			'data-testid': 'tooltip-b',
			tooltipText: 'Tooltip B text',
			icon: Information,
			portalTooltip: false
		});

		$$renderer.push(`<!----></div>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}