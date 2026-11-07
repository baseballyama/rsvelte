import * as $ from 'svelte/internal/server';
import { mergeProps } from "svelte-toolbelt";
import { ScrollAreaScrollbarScrollState } from "../scroll-area.svelte.js";
import ScrollAreaScrollbarVisible from "./scroll-area-scrollbar-visible.svelte";
import PresenceLayer from "$lib/bits/utilities/presence-layer/presence-layer.svelte";

export default function Scroll_area_scrollbar_scroll($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { forceMount = false, $$slots, $$events, ...restProps } = $$props;
		const scrollbarScrollState = ScrollAreaScrollbarScrollState.create();
		const mergedProps = $.derived(() => mergeProps(restProps, scrollbarScrollState.props));

		{
			function presence($$renderer) {
				ScrollAreaScrollbarVisible($$renderer, $.spread_props([mergedProps()]));
			}

			PresenceLayer($$renderer, $.spread_props([
				mergedProps(),
				{
					open: forceMount || !scrollbarScrollState.isHidden,
					ref: scrollbarScrollState.scrollbar.opts.ref,
					presence,
					$$slots: { presence: true }
				}
			]));
		}
	});
}