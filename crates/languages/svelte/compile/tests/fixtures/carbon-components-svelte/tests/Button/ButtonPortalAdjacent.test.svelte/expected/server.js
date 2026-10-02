import * as $ from 'svelte/internal/server';
import Button from "carbon-components-svelte/Button/Button.svelte";
import Add from "carbon-icons-svelte/lib/Add.svelte";

export default function ButtonPortalAdjacent_test($$renderer) {
	Button($$renderer, {
		'data-testid': 'btn-portal-a',
		icon: Add,
		portalTooltip: true,
		tooltipPosition: 'top',
		iconDescription: 'Tooltip A'
	});

	$$renderer.push(`<!----> `);

	Button($$renderer, {
		'data-testid': 'btn-portal-b',
		icon: Add,
		portalTooltip: true,
		tooltipPosition: 'top',
		iconDescription: 'Tooltip B'
	});

	$$renderer.push(`<!---->`);
}