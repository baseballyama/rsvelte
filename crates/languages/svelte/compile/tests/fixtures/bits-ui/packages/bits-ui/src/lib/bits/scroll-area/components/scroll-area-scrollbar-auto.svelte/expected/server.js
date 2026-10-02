import * as $ from 'svelte/internal/server';
import { mergeProps } from "svelte-toolbelt";
import { ScrollAreaScrollbarAutoState } from "../scroll-area.svelte.js";
import ScrollAreaScrollbarVisible from "./scroll-area-scrollbar-visible.svelte";
import PresenceLayer from "$lib/bits/utilities/presence-layer/presence-layer.svelte";

export default function Scroll_area_scrollbar_auto($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { forceMount = false, $$slots, $$events, ...restProps } = $$props;
		const scrollbarAutoState = ScrollAreaScrollbarAutoState.create();
		const mergedProps = $.derived(() => mergeProps(restProps, scrollbarAutoState.props));

		{
			function presence($$renderer) {
				ScrollAreaScrollbarVisible($$renderer, $.spread_props([mergedProps()]));
			}

			PresenceLayer($$renderer, {
				open: forceMount || scrollbarAutoState.isVisible,
				ref: scrollbarAutoState.scrollbar.opts.ref,
				presence,
				$$slots: { presence: true }
			});
		}
	});
}