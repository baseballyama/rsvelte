import * as $ from 'svelte/internal/server';
import { ScrollAreaRootContext } from "../scroll-area.svelte.js";
import ScrollAreaCornerImpl from "./scroll-area-corner-impl.svelte";
import { createId } from "$lib/internal/create-id.js";

export default function Scroll_area_corner($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const uid = $.props_id($$renderer);

		let {
			ref = null,
			id = createId(uid),
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const scrollAreaState = ScrollAreaRootContext.get();
		const hasBothScrollbarsVisible = $.derived(() => Boolean(scrollAreaState.scrollbarXNode && scrollAreaState.scrollbarYNode));
		const hasCorner = $.derived(() => scrollAreaState.opts.type.current !== "scroll" && hasBothScrollbarsVisible());
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (hasCorner()) {
				$$renderer.push('<!--[0-->');

				ScrollAreaCornerImpl($$renderer, $.spread_props([
					restProps,
					{
						id,
						get ref() {
							return ref;
						},

						set ref($$value) {
							ref = $$value;
							$$settled = false;
						}
					}
				]));
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]-->`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
		$.bind_props($$props, { ref });
	});
}