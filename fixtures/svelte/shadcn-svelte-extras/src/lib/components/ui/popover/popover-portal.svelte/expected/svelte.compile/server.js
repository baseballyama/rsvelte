import * as $ from 'svelte/internal/server';
import { Popover as PopoverPrimitive } from 'bits-ui';

export default function Popover_portal($$renderer, $$props) {
	let { $$slots, $$events, ...restProps } = $$props;

	if (PopoverPrimitive.Portal) {
		$$renderer.push('<!--[-->');
		PopoverPrimitive.Portal($$renderer, $.spread_props([restProps]));
		$$renderer.push('<!--]-->');
	} else {
		$$renderer.push('<!--[!-->');
		$$renderer.push('<!--]-->');
	}
}