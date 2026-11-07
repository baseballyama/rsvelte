import * as $ from 'svelte/internal/server';
import Tooltip from "carbon-components-svelte/Tooltip/Tooltip.svelte";

export default function TooltipNoLabel_test($$renderer) {
	Tooltip($$renderer, {});
}