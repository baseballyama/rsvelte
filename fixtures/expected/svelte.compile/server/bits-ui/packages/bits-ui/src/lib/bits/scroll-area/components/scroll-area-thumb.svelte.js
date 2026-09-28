import * as $ from 'svelte/internal/server';
import { ScrollAreaScrollbarVisibleContext } from "../scroll-area.svelte.js";
import ScrollAreaThumbImpl from "./scroll-area-thumb-impl.svelte";
import { createId } from "$lib/internal/create-id.js";
import PresenceLayer from "$lib/bits/utilities/presence-layer/presence-layer.svelte";

export default function Scroll_area_thumb($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const uid = $.props_id($$renderer);

		let {
			id = createId(uid),
			ref = null,
			forceMount = false,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const scrollbarState = ScrollAreaScrollbarVisibleContext.get();
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			{
				function presence($$renderer, { present }) {
					ScrollAreaThumbImpl($$renderer, $.spread_props([
						restProps,
						{
							id,
							present,
							get ref() {
								return ref;
							},

							set ref($$value) {
								ref = $$value;
								$$settled = false;
							}
						}
					]));
				}

				PresenceLayer($$renderer, {
					open: forceMount || scrollbarState.hasThumb,
					ref: scrollbarState.scrollbar.opts.ref,
					presence,
					$$slots: { presence: true }
				});
			}
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