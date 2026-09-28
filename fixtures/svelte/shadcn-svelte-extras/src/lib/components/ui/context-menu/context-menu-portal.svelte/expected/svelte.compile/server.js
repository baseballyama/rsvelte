import * as $ from 'svelte/internal/server';
import { ContextMenu as ContextMenuPrimitive } from 'bits-ui';

export default function Context_menu_portal($$renderer, $$props) {
	let { $$slots, $$events, ...restProps } = $$props;

	if (ContextMenuPrimitive.Portal) {
		$$renderer.push('<!--[-->');
		ContextMenuPrimitive.Portal($$renderer, $.spread_props([restProps]));
		$$renderer.push('<!--]-->');
	} else {
		$$renderer.push('<!--[!-->');
		$$renderer.push('<!--]-->');
	}
}