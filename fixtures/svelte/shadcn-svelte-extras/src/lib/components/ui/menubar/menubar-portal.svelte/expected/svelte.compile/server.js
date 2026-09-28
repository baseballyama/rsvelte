import * as $ from 'svelte/internal/server';
import { Menubar as MenubarPrimitive } from 'bits-ui';

export default function Menubar_portal($$renderer, $$props) {
	let { $$slots, $$events, ...restProps } = $$props;

	if (MenubarPrimitive.Portal) {
		$$renderer.push('<!--[-->');
		MenubarPrimitive.Portal($$renderer, $.spread_props([restProps]));
		$$renderer.push('<!--]-->');
	} else {
		$$renderer.push('<!--[!-->');
		$$renderer.push('<!--]-->');
	}
}