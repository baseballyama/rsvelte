import * as $ from 'svelte/internal/server';
import { DropdownMenu as DropdownMenuPrimitive } from "bits-ui";

export default function Picker_group($$renderer, $$props) {
	let { $$slots, $$events, ...restProps } = $$props;

	if (DropdownMenuPrimitive.Group) {
		$$renderer.push('<!--[-->');
		DropdownMenuPrimitive.Group($$renderer, $.spread_props([{ 'data-slot': 'dropdown-menu-group' }, restProps]));
		$$renderer.push('<!--]-->');
	} else {
		$$renderer.push('<!--[!-->');
		$$renderer.push('<!--]-->');
	}
}