import * as $ from 'svelte/internal/server';
import { boxWith, mergeProps } from "svelte-toolbelt";
import { NavigationMenuContentState } from "../navigation-menu.svelte.js";
import NavigationMenuContentImpl from "./navigation-menu-content-impl.svelte";
import { createId } from "$lib/internal/create-id.js";
import { getDataTransitionAttrs } from "$lib/internal/attrs.js";
import Portal from "$lib/bits/utilities/portal/portal.svelte";
import PresenceLayer from "$lib/bits/utilities/presence-layer/presence-layer.svelte";
import Mounted from "$lib/bits/utilities/mounted.svelte";

export default function Navigation_menu_content($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const uid = $.props_id($$renderer);

		let {
			ref = null,
			id = createId(uid),
			children,
			child,
			forceMount = false,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const contentState = NavigationMenuContentState.create({
			id: boxWith(() => id),
			ref: boxWith(() => ref, (v) => ref = v)
		});

		const mergedProps = $.derived(() => mergeProps(restProps, contentState.props));
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Portal($$renderer, {
				to: contentState.context.viewportRef.current || undefined,
				disabled: !contentState.context.viewportRef.current,
				children: ($$renderer) => {
					{
						function presence($$renderer, { transitionStatus }) {
							NavigationMenuContentImpl($$renderer, $.spread_props([
								mergeProps(mergedProps(), getDataTransitionAttrs(transitionStatus)),
								{ children, child }
							]));

							$$renderer.push(`<!----> `);

							Mounted($$renderer, {
								get mounted() {
									return contentState.mounted;
								},

								set mounted($$value) {
									contentState.mounted = $$value;
									$$settled = false;
								}
							});

							$$renderer.push(`<!---->`);
						}

						PresenceLayer($$renderer, {
							open: forceMount || contentState.open || contentState.isLastActiveValue,
							ref: contentState.opts.ref,
							presence,
							$$slots: { presence: true }
						});
					}
				},
				$$slots: { default: true }
			});
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