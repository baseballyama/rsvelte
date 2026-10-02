import * as $ from 'svelte/internal/server';
import { IsMounted } from "runed";
import { boxWith, mergeProps } from "svelte-toolbelt";
import { ScrollAreaScrollbarYState } from "../scroll-area.svelte.js";
import ScrollAreaScrollbarShared from "./scroll-area-scrollbar-shared.svelte";

export default function Scroll_area_scrollbar_y($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { $$slots, $$events, ...restProps } = $$props;
		const isMounted = new IsMounted();
		const scrollbarYState = ScrollAreaScrollbarYState.create({ mounted: boxWith(() => isMounted.current) });

		// oxlint-disable-next-line no-explicit-any
		const mergedProps = $.derived(() => mergeProps(restProps, scrollbarYState.props));

		ScrollAreaScrollbarShared($$renderer, $.spread_props([mergedProps()]));
	});
}