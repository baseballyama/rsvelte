import * as $ from 'svelte/internal/server';
import { IsMounted } from "runed";
import { boxWith, mergeProps } from "svelte-toolbelt";
import { ScrollAreaScrollbarXState } from "../scroll-area.svelte.js";
import ScrollAreaScrollbarShared from "./scroll-area-scrollbar-shared.svelte";

export default function Scroll_area_scrollbar_x($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { $$slots, $$events, ...restProps } = $$props;
		const isMounted = new IsMounted();
		const scrollbarXState = ScrollAreaScrollbarXState.create({ mounted: boxWith(() => isMounted.current) });

		// oxlint-disable-next-line no-explicit-any
		const mergedProps = $.derived(() => mergeProps(restProps, scrollbarXState.props));

		ScrollAreaScrollbarShared($$renderer, $.spread_props([mergedProps()]));
	});
}