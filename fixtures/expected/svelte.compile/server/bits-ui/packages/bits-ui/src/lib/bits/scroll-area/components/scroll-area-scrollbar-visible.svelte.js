import * as $ from 'svelte/internal/server';
import { ScrollAreaScrollbarVisibleState } from "../scroll-area.svelte.js";
import ScrollAreaScrollbarX from "./scroll-area-scrollbar-x.svelte";
import ScrollAreaScrollbarY from "./scroll-area-scrollbar-y.svelte";

export default function Scroll_area_scrollbar_visible($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { $$slots, $$events, ...restProps } = $$props;
		const scrollbarVisibleState = ScrollAreaScrollbarVisibleState.create();

		if (scrollbarVisibleState.scrollbar.opts.orientation.current === "horizontal") {
			$$renderer.push('<!--[0-->');
			ScrollAreaScrollbarX($$renderer, $.spread_props([restProps]));
		} else {
			$$renderer.push('<!--[-1-->');
			ScrollAreaScrollbarY($$renderer, $.spread_props([restProps]));
		}

		$$renderer.push(`<!--]-->`);
	});
}