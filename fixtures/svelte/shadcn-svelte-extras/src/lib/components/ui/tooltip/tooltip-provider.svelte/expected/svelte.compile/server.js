import * as $ from 'svelte/internal/server';
import { Tooltip as TooltipPrimitive } from 'bits-ui';

export default function Tooltip_provider($$renderer, $$props) {
	let { delayDuration = 0, $$slots, $$events, ...restProps } = $$props;

	if (TooltipPrimitive.Provider) {
		$$renderer.push('<!--[-->');
		TooltipPrimitive.Provider($$renderer, $.spread_props([{ delayDuration }, restProps]));
		$$renderer.push('<!--]-->');
	} else {
		$$renderer.push('<!--[!-->');
		$$renderer.push('<!--]-->');
	}
}