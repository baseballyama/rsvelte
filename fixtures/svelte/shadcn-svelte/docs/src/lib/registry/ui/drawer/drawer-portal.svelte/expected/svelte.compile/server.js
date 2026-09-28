import * as $ from 'svelte/internal/server';
import { Drawer as DrawerPrimitive } from "vaul-svelte";

export default function Drawer_portal($$renderer, $$props) {
	let { $$slots, $$events, ...restProps } = $$props;

	if (DrawerPrimitive.Portal) {
		$$renderer.push('<!--[-->');
		DrawerPrimitive.Portal($$renderer, $.spread_props([restProps]));
		$$renderer.push('<!--]-->');
	} else {
		$$renderer.push('<!--[!-->');
		$$renderer.push('<!--]-->');
	}
}