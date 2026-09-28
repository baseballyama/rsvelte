import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { boxWith } from "svelte-toolbelt";
import { ScrollAreaScrollbarState } from "../scroll-area.svelte.js";
import ScrollAreaScrollbarAuto from "./scroll-area-scrollbar-auto.svelte";
import ScrollAreaScrollbarScroll from "./scroll-area-scrollbar-scroll.svelte";
import ScrollAreaScrollbarHover from "./scroll-area-scrollbar-hover.svelte";
import ScrollAreaScrollbarVisible from "./scroll-area-scrollbar-visible.svelte";
import { createId } from "$lib/internal/create-id.js";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'ref',
	'id',
	'orientation'
]);

export default function Scroll_area_scrollbar($$anchor, $$props) {
	const uid = $.props_id();

	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		id = $.prop($$props, 'id', 19, () => createId(uid)),
		restProps = $.rest_props($$props, rest_excludes);

	const scrollbarState = ScrollAreaScrollbarState.create({
		orientation: boxWith(() => $$props.orientation),
		id: boxWith(() => id()),
		ref: boxWith(() => ref(), (v) => ref(v))
	});

	const type = $.derived(() => scrollbarState.root.opts.type.current);
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			ScrollAreaScrollbarHover($$anchor, $.spread_props(() => restProps, {
				get id() {
					return id();
				}
			}));
		};

		var consequent_1 = ($$anchor) => {
			ScrollAreaScrollbarScroll($$anchor, $.spread_props(() => restProps, {
				get id() {
					return id();
				}
			}));
		};

		var consequent_2 = ($$anchor) => {
			ScrollAreaScrollbarAuto($$anchor, $.spread_props(() => restProps, {
				get id() {
					return id();
				}
			}));
		};

		var consequent_3 = ($$anchor) => {
			ScrollAreaScrollbarVisible($$anchor, $.spread_props(() => restProps, {
				get id() {
					return id();
				}
			}));
		};

		$.if(node, ($$render) => {
			if ($.get(type) === "hover") $$render(consequent); else if ($.get(type) === "scroll") $$render(consequent_1, 1); else if ($.get(type) === "auto") $$render(consequent_2, 2); else if ($.get(type) === "always") $$render(consequent_3, 3);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}