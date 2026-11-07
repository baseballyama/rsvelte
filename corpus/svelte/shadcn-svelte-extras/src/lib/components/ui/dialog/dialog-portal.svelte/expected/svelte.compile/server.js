import * as $ from 'svelte/internal/server';
import { Dialog as DialogPrimitive } from 'bits-ui';

export default function Dialog_portal($$renderer, $$props) {
	let { $$slots, $$events, ...restProps } = $$props;

	if (DialogPrimitive.Portal) {
		$$renderer.push('<!--[-->');
		DialogPrimitive.Portal($$renderer, $.spread_props([restProps]));
		$$renderer.push('<!--]-->');
	} else {
		$$renderer.push('<!--[!-->');
		$$renderer.push('<!--]-->');
	}
}