import * as $ from 'svelte/internal/server';
import { boxWith } from "svelte-toolbelt";
import { ScrollAreaScrollbarState } from "../scroll-area.svelte.js";
import ScrollAreaScrollbarAuto from "./scroll-area-scrollbar-auto.svelte";
import ScrollAreaScrollbarScroll from "./scroll-area-scrollbar-scroll.svelte";
import ScrollAreaScrollbarHover from "./scroll-area-scrollbar-hover.svelte";
import ScrollAreaScrollbarVisible from "./scroll-area-scrollbar-visible.svelte";
import { createId } from "$lib/internal/create-id.js";

export default function Scroll_area_scrollbar($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const uid = $.props_id($$renderer);

		let {
			ref = null,
			id = createId(uid),
			orientation,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const scrollbarState = ScrollAreaScrollbarState.create({
			orientation: boxWith(() => orientation),
			id: boxWith(() => id),
			ref: boxWith(() => ref, (v) => ref = v)
		});

		const type = $.derived(() => scrollbarState.root.opts.type.current);

		if (type() === "hover") {
			$$renderer.push('<!--[0-->');
			ScrollAreaScrollbarHover($$renderer, $.spread_props([restProps, { id }]));
		} else if (type() === "scroll") {
			$$renderer.push('<!--[1-->');
			ScrollAreaScrollbarScroll($$renderer, $.spread_props([restProps, { id }]));
		} else if (type() === "auto") {
			$$renderer.push('<!--[2-->');
			ScrollAreaScrollbarAuto($$renderer, $.spread_props([restProps, { id }]));
		} else if (type() === "always") {
			$$renderer.push('<!--[3-->');
			ScrollAreaScrollbarVisible($$renderer, $.spread_props([restProps, { id }]));
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
		$.bind_props($$props, { ref });
	});
}