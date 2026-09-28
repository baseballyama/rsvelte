import * as $ from 'svelte/internal/server';
import { boxWith, mergeProps } from "svelte-toolbelt";
import { NavigationMenuIndicatorState } from "../navigation-menu.svelte.js";
import NavigationMenuIndicatorImpl from "./navigation-menu-indicator-impl.svelte";
import { createId } from "$lib/internal/create-id.js";
import { getDataTransitionAttrs } from "$lib/internal/attrs.js";
import PresenceLayer from "$lib/bits/utilities/presence-layer/presence-layer.svelte";
import Portal from "$lib/bits/utilities/portal/portal.svelte";

export default function Navigation_menu_indicator($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const uid = $.props_id($$renderer);

		let {
			id = createId(uid),
			ref = null,
			children,
			child,
			forceMount = false,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const indicatorState = NavigationMenuIndicatorState.create();
		const mergedProps = $.derived(() => mergeProps(restProps));
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (indicatorState.context.indicatorTrackRef.current) {
				$$renderer.push('<!--[0-->');

				Portal($$renderer, {
					to: indicatorState.context.indicatorTrackRef.current,
					children: ($$renderer) => {
						{
							function presence($$renderer, { transitionStatus }) {
								NavigationMenuIndicatorImpl($$renderer, $.spread_props([
									mergeProps(mergedProps(), getDataTransitionAttrs(transitionStatus)),
									{
										children,
										child,
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
							}

							PresenceLayer($$renderer, {
								open: forceMount || indicatorState.isVisible,
								ref: boxWith(() => ref),
								presence,
								$$slots: { presence: true }
							});
						}
					},
					$$slots: { default: true }
				});
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