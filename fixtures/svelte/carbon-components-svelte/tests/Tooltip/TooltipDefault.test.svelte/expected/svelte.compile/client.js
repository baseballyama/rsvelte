import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Tooltip from "carbon-components-svelte/Tooltip/Tooltip.svelte";

export default function TooltipDefault_test($$anchor) {
	Tooltip($$anchor, { iconDescription: 'Information' });
}