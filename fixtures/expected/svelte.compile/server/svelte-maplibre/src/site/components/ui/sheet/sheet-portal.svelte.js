import * as $ from 'svelte/internal/server';
import { Dialog as SheetPrimitive } from 'bits-ui';

export default function Sheet_portal($$renderer, $$props) {
	let { $$slots, $$events, ...restProps } = $$props;

	if (SheetPrimitive.Portal) {
		$$renderer.push('<!--[-->');
		SheetPrimitive.Portal($$renderer, $.spread_props([restProps]));
		$$renderer.push('<!--]-->');
	} else {
		$$renderer.push('<!--[!-->');
		$$renderer.push('<!--]-->');
	}
}