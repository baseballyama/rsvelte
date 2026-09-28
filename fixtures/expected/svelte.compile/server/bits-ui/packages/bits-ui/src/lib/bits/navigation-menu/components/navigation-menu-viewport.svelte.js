import * as $ from 'svelte/internal/server';
import { NavigationMenuViewportState } from "../navigation-menu.svelte.js";
import { createId } from "$lib/internal/create-id.js";
import { getDataTransitionAttrs } from "$lib/internal/attrs.js";
import PresenceLayer from "$lib/bits/utilities/presence-layer/presence-layer.svelte";
import { boxWith, mergeProps } from "svelte-toolbelt";
import { Mounted } from "$lib/bits/utilities/index.js";

export default function Navigation_menu_viewport($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const uid = $.props_id($$renderer);

		let {
			id = createId(uid),
			ref = null,
			forceMount = false,
			child,
			children,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const viewportState = NavigationMenuViewportState.create({
			id: boxWith(() => id),
			ref: boxWith(() => ref, (v) => ref = v)
		});

		const mergedProps = $.derived(() => mergeProps(restProps, viewportState.props));
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			{
				function presence($$renderer, { transitionStatus }) {
					const presenceProps = getDataTransitionAttrs(transitionStatus);

					if (child) {
						$$renderer.push('<!--[0-->');
						child($$renderer, { props: mergeProps(mergedProps(), presenceProps) });
						$$renderer.push(`<!---->`);
					} else {
						$$renderer.push(`<!--[-1--><div${$.attributes({ ...mergeProps(mergedProps(), presenceProps) })}>`);
						children?.($$renderer);
						$$renderer.push(`<!----></div>`);
					}

					$$renderer.push(`<!--]--> `);

					Mounted($$renderer, {
						get mounted() {
							return viewportState.mounted;
						},

						set mounted($$value) {
							viewportState.mounted = $$value;
							$$settled = false;
						}
					});

					$$renderer.push(`<!---->`);
				}

				PresenceLayer($$renderer, {
					open: forceMount || viewportState.open,
					ref: viewportState.opts.ref,
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