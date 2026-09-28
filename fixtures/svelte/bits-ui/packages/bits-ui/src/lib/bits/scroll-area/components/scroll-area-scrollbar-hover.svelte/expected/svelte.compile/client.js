import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { mergeProps } from "svelte-toolbelt";
import { ScrollAreaScrollbarAutoState, ScrollAreaScrollbarHoverState } from "../scroll-area.svelte.js";
import ScrollAreaScrollbarVisible from "./scroll-area-scrollbar-visible.svelte";
import PresenceLayer from "$lib/bits/utilities/presence-layer/presence-layer.svelte";

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'forceMount']);

export default function Scroll_area_scrollbar_hover($$anchor, $$props) {
	$.push($$props, true);

	let forceMount = $.prop($$props, 'forceMount', 3, false),
		restProps = $.rest_props($$props, rest_excludes);

	const scrollbarHoverState = ScrollAreaScrollbarHoverState.create();
	const scrollbarAutoState = ScrollAreaScrollbarAutoState.create();

	const mergedProps = $.derived(() => mergeProps(restProps, scrollbarHoverState.props, scrollbarAutoState.props, {
		"data-state": scrollbarHoverState.isVisible ? "visible" : "hidden"
	}));

	const open = $.derived(() => forceMount() || scrollbarHoverState.isVisible && scrollbarAutoState.isVisible);

	{
		const presence = ($$anchor) => {
			ScrollAreaScrollbarVisible($$anchor, $.spread_props(() => $.get(mergedProps)));
		};

		PresenceLayer($$anchor, {
			get open() {
				return $.get(open);
			},

			get ref() {
				return scrollbarAutoState.scrollbar.opts.ref;
			},
			presence,
			$$slots: { presence: true }
		});
	}

	$.pop();
}