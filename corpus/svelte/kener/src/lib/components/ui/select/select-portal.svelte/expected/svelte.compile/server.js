import * as $ from 'svelte/internal/server';
import { Select as SelectPrimitive } from "bits-ui";

export default function Select_portal($$renderer, $$props) {
	let { $$slots, $$events, ...restProps } = $$props;

	if (SelectPrimitive.Portal) {
		$$renderer.push('<!--[-->');
		SelectPrimitive.Portal($$renderer, $.spread_props([restProps]));
		$$renderer.push('<!--]-->');
	} else {
		$$renderer.push('<!--[!-->');
		$$renderer.push('<!--]-->');
	}
}