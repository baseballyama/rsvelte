import * as $ from 'svelte/internal/server';
import { boxWith, mergeProps } from "svelte-toolbelt";
import { NavigationMenuTriggerState } from "../navigation-menu.svelte.js";
import { createId } from "$lib/internal/create-id.js";
import VisuallyHidden from "$lib/bits/utilities/visually-hidden/visually-hidden.svelte";
import Mounted from "$lib/bits/utilities/mounted.svelte";

export default function Navigation_menu_trigger($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const uid = $.props_id($$renderer);

		let {
			id = createId(uid),
			disabled = false,
			children,
			child,
			ref = null,
			tabindex = 0,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const triggerState = NavigationMenuTriggerState.create({
			id: boxWith(() => id),
			disabled: boxWith(() => disabled ?? false),
			ref: boxWith(() => ref, (v) => ref = v)
		});

		const mergedProps = $.derived(() => mergeProps(restProps, triggerState.props, { tabindex }));
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (child) {
				$$renderer.push('<!--[0-->');
				child($$renderer, { props: mergedProps() });
				$$renderer.push(`<!---->`);
			} else {
				$$renderer.push(`<!--[-1--><button${$.attributes({ ...mergedProps() })}>`);
				children?.($$renderer);
				$$renderer.push(`<!----></button>`);
			}

			$$renderer.push(`<!--]--> `);

			if (triggerState.open) {
				$$renderer.push('<!--[0-->');
				VisuallyHidden($$renderer, $.spread_props([triggerState.focusProxyProps]));
				$$renderer.push(`<!----> `);

				Mounted($$renderer, {
					get mounted() {
						return triggerState.focusProxyMounted;
					},

					set mounted($$value) {
						triggerState.focusProxyMounted = $$value;
						$$settled = false;
					}
				});

				$$renderer.push(`<!----> `);

				if (triggerState.context.viewportRef.current) {
					$$renderer.push(`<!--[0--><span${$.attr('aria-owns', triggerState.itemContext.contentId ?? undefined)}></span>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]-->`);
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