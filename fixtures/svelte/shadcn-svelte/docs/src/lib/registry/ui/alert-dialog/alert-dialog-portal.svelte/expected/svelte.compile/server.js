import * as $ from 'svelte/internal/server';
import { AlertDialog as AlertDialogPrimitive } from "bits-ui";

export default function Alert_dialog_portal($$renderer, $$props) {
	let { $$slots, $$events, ...restProps } = $$props;

	if (AlertDialogPrimitive.Portal) {
		$$renderer.push('<!--[-->');
		AlertDialogPrimitive.Portal($$renderer, $.spread_props([restProps]));
		$$renderer.push('<!--]-->');
	} else {
		$$renderer.push('<!--[!-->');
		$$renderer.push('<!--]-->');
	}
}