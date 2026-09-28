import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { IsMounted } from "runed";
import { boxWith, mergeProps } from "svelte-toolbelt";
import { ScrollAreaScrollbarYState } from "../scroll-area.svelte.js";
import ScrollAreaScrollbarShared from "./scroll-area-scrollbar-shared.svelte";

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy']);

export default function Scroll_area_scrollbar_y($$anchor, $$props) {
	$.push($$props, true);

	let restProps = $.rest_props($$props, rest_excludes);
	const isMounted = new IsMounted();
	const scrollbarYState = ScrollAreaScrollbarYState.create({ mounted: boxWith(() => isMounted.current) });

	// oxlint-disable-next-line no-explicit-any
	const mergedProps = $.derived(() => mergeProps(restProps, scrollbarYState.props));

	ScrollAreaScrollbarShared($$anchor, $.spread_props(() => $.get(mergedProps)));
	$.pop();
}