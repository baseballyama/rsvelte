import * as $ from 'svelte/internal/server';
import { LinkPreview as HoverCardPrimitive } from "bits-ui";

export default function Hover_card_portal($$renderer, $$props) {
	let { $$slots, $$events, ...restProps } = $$props;

	if (HoverCardPrimitive.Portal) {
		$$renderer.push('<!--[-->');
		HoverCardPrimitive.Portal($$renderer, $.spread_props([restProps]));
		$$renderer.push('<!--]-->');
	} else {
		$$renderer.push('<!--[!-->');
		$$renderer.push('<!--]-->');
	}
}