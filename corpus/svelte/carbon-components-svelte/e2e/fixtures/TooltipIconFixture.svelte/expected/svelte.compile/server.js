import * as $ from 'svelte/internal/server';
import { TooltipIcon } from "carbon-components-svelte";
import Information from "carbon-icons-svelte/lib/Information.svelte";

export default function TooltipIconFixture($$renderer) {
	TooltipIcon($$renderer, {
		'data-testid': 'tooltip-icon',
		tooltipText: 'Icon tooltip text',
		icon: Information
	});
}