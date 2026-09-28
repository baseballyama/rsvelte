import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { ScrollAreaRootContext } from "../scroll-area.svelte.js";
import ScrollAreaCornerImpl from "./scroll-area-corner-impl.svelte";
import { createId } from "$lib/internal/create-id.js";

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'ref', 'id']);

export default function Scroll_area_corner($$anchor, $$props) {
	const uid = $.props_id();

	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		id = $.prop($$props, 'id', 19, () => createId(uid)),
		restProps = $.rest_props($$props, rest_excludes);

	const scrollAreaState = ScrollAreaRootContext.get();
	const hasBothScrollbarsVisible = $.derived(() => Boolean(scrollAreaState.scrollbarXNode && scrollAreaState.scrollbarYNode));
	const hasCorner = $.derived(() => scrollAreaState.opts.type.current !== "scroll" && $.get(hasBothScrollbarsVisible));
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			ScrollAreaCornerImpl($$anchor, $.spread_props(() => restProps, {
				get id() {
					return id();
				},

				get ref() {
					return ref();
				},

				set ref($$value) {
					ref($$value);
				}
			}));
		};

		$.if(node, ($$render) => {
			if ($.get(hasCorner)) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}