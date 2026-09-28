import * as $ from 'svelte/internal/server';
import { mergeProps } from "svelte-toolbelt";
import { MenuArrowState } from "../menu.svelte.js";
import FloatingLayerArrow from "$lib/bits/utilities/floating-layer/components/floating-layer-arrow.svelte";

export default function Menu_arrow($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { ref = null, $$slots, $$events, ...restProps } = $$props;
		const arrowState = MenuArrowState.create();
		const mergedProps = $.derived(() => mergeProps(restProps, arrowState.props));
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			FloatingLayerArrow($$renderer, $.spread_props([
				mergedProps(),
				{
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

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
		$.bind_props($$props, { ref });
	});
}