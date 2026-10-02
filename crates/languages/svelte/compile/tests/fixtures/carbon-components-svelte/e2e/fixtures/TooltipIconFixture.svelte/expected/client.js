import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { TooltipIcon } from "carbon-components-svelte";
import Information from "carbon-icons-svelte/lib/Information.svelte";

export default function TooltipIconFixture($$anchor) {
	TooltipIcon($$anchor, {
		'data-testid': 'tooltip-icon',
		tooltipText: 'Icon tooltip text',
		get icon() {
			return Information;
		}
	});
}