import * as $ from 'svelte/internal/server';
import { Tooltip as TooltipPrimitive } from "bits-ui";

export default function Tooltip_portal($$renderer, $$props) {
	let { $$slots, $$events, ...restProps } = $$props;

	if (TooltipPrimitive.Portal) {
		$$renderer.push('<!--[-->');
		TooltipPrimitive.Portal($$renderer, $.spread_props([restProps]));
		$$renderer.push('<!--]-->');
	} else {
		$$renderer.push('<!--[!-->');
		$$renderer.push('<!--]-->');
	}
}