import * as $ from 'svelte/internal/server';
import { Menubar as MenubarPrimitive } from 'bits-ui';

export default function Menubar_menu($$renderer, $$props) {
	let { $$slots, $$events, ...restProps } = $$props;

	if (MenubarPrimitive.Menu) {
		$$renderer.push('<!--[-->');
		MenubarPrimitive.Menu($$renderer, $.spread_props([restProps]));
		$$renderer.push('<!--]-->');
	} else {
		$$renderer.push('<!--[!-->');
		$$renderer.push('<!--]-->');
	}
}