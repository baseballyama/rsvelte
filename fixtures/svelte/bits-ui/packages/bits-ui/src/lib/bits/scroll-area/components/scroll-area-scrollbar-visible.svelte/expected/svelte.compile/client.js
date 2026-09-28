import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { ScrollAreaScrollbarVisibleState } from "../scroll-area.svelte.js";
import ScrollAreaScrollbarX from "./scroll-area-scrollbar-x.svelte";
import ScrollAreaScrollbarY from "./scroll-area-scrollbar-y.svelte";

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy']);

export default function Scroll_area_scrollbar_visible($$anchor, $$props) {
	$.push($$props, true);

	let restProps = $.rest_props($$props, rest_excludes);
	const scrollbarVisibleState = ScrollAreaScrollbarVisibleState.create();
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			ScrollAreaScrollbarX($$anchor, $.spread_props(() => restProps));
		};

		var alternate = ($$anchor) => {
			ScrollAreaScrollbarY($$anchor, $.spread_props(() => restProps));
		};

		$.if(node, ($$render) => {
			if (scrollbarVisibleState.scrollbar.opts.orientation.current === "horizontal") $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}