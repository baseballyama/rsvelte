import * as $ from 'svelte/internal/server';
import { DropdownMenu as DropdownMenuPrimitive } from "bits-ui";

export default function Dropdown_menu_portal($$renderer, $$props) {
	let { $$slots, $$events, ...restProps } = $$props;

	if (DropdownMenuPrimitive.Portal) {
		$$renderer.push('<!--[-->');
		DropdownMenuPrimitive.Portal($$renderer, $.spread_props([restProps]));
		$$renderer.push('<!--]-->');
	} else {
		$$renderer.push('<!--[!-->');
		$$renderer.push('<!--]-->');
	}
}