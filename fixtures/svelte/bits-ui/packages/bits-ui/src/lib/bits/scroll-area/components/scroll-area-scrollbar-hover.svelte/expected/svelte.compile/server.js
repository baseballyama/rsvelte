import * as $ from 'svelte/internal/server';
import { mergeProps } from "svelte-toolbelt";
import { ScrollAreaScrollbarAutoState, ScrollAreaScrollbarHoverState } from "../scroll-area.svelte.js";
import ScrollAreaScrollbarVisible from "./scroll-area-scrollbar-visible.svelte";
import PresenceLayer from "$lib/bits/utilities/presence-layer/presence-layer.svelte";

export default function Scroll_area_scrollbar_hover($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { forceMount = false, $$slots, $$events, ...restProps } = $$props;
		const scrollbarHoverState = ScrollAreaScrollbarHoverState.create();
		const scrollbarAutoState = ScrollAreaScrollbarAutoState.create();

		const mergedProps = $.derived(() => mergeProps(restProps, scrollbarHoverState.props, scrollbarAutoState.props, {
			"data-state": scrollbarHoverState.isVisible ? "visible" : "hidden"
		}));

		const open = $.derived(() => forceMount || scrollbarHoverState.isVisible && scrollbarAutoState.isVisible);

		{
			function presence($$renderer) {
				ScrollAreaScrollbarVisible($$renderer, $.spread_props([mergedProps()]));
			}

			PresenceLayer($$renderer, {
				open: open(),
				ref: scrollbarAutoState.scrollbar.opts.ref,
				presence,
				$$slots: { presence: true }
			});
		}
	});
}