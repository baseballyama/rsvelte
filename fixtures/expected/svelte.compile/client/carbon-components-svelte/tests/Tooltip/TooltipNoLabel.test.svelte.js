import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Tooltip from "carbon-components-svelte/Tooltip/Tooltip.svelte";

export default function TooltipNoLabel_test($$anchor) {
	Tooltip($$anchor, {});
}