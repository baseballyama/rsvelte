import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { mergeProps } from "svelte-toolbelt";
import { ScrollAreaScrollbarAutoState } from "../scroll-area.svelte.js";
import ScrollAreaScrollbarVisible from "./scroll-area-scrollbar-visible.svelte";
import PresenceLayer from "$lib/bits/utilities/presence-layer/presence-layer.svelte";

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'forceMount']);

export default function Scroll_area_scrollbar_auto($$anchor, $$props) {
	$.push($$props, true);

	let forceMount = $.prop($$props, 'forceMount', 3, false),
		restProps = $.rest_props($$props, rest_excludes);

	const scrollbarAutoState = ScrollAreaScrollbarAutoState.create();
	const mergedProps = $.derived(() => mergeProps(restProps, scrollbarAutoState.props));

	{
		const presence = ($$anchor) => {
			ScrollAreaScrollbarVisible($$anchor, $.spread_props(() => $.get(mergedProps)));
		};

		let $0 = $.derived(() => forceMount() || scrollbarAutoState.isVisible);

		PresenceLayer($$anchor, {
			get open() {
				return $.get($0);
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