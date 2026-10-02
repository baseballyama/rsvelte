import * as $ from 'svelte/internal/server';
import { boxWith, mergeProps } from "svelte-toolbelt";
import { untrack } from "svelte";

import {
	NavigationMenuItemContext,
	NavigationMenuItemState,
	NavigationMenuContentImplState
} from "../navigation-menu.svelte.js";

import { noop } from "$lib/internal/noop.js";
import { createId } from "$lib/internal/create-id.js";
import DismissibleLayer from "$lib/bits/utilities/dismissible-layer/dismissible-layer.svelte";
import EscapeLayer from "$lib/bits/utilities/escape-layer/escape-layer.svelte";

export default function Navigation_menu_content_impl($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const uid = $.props_id($$renderer);

		let {
			ref = null,
			id = createId(uid),
			child: childProp,
			children: childrenProp,
			onInteractOutside = noop,
			onFocusOutside = noop,
			onEscapeKeydown = noop,
			escapeKeydownBehavior = "close",
			interactOutsideBehavior = "close",
			itemState,
			onRefChange,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const contentImplState = NavigationMenuContentImplState.create(
			{
				id: boxWith(() => id),
				ref: boxWith(() => ref, (v) => {
					ref = v;
					untrack(() => onRefChange?.(v));
				})
			},
			itemState
		);

		if (itemState) {
			NavigationMenuItemContext.set(itemState);
		}

		const mergedProps = $.derived(() => mergeProps(restProps, contentImplState.props));

		{
			function children($$renderer, { props: dismissibleProps }) {
				EscapeLayer($$renderer, {
					enabled: true,
					ref: contentImplState.opts.ref,
					onEscapeKeydown: (e) => {
						onEscapeKeydown(e);

						if (e.defaultPrevented) return;

						contentImplState.onEscapeKeydown(e);
					},
					escapeKeydownBehavior,
					children: ($$renderer) => {
						const finalProps = mergeProps(mergedProps(), dismissibleProps);

						if (childProp) {
							$$renderer.push('<!--[0-->');
							childProp($$renderer, { props: finalProps });
							$$renderer.push(`<!---->`);
						} else {
							$$renderer.push(`<!--[-1--><div${$.attributes({ ...finalProps })}>`);
							childrenProp?.($$renderer);
							$$renderer.push(`<!----></div>`);
						}

						$$renderer.push(`<!--]-->`);
					},
					$$slots: { default: true }
				});
			}

			DismissibleLayer($$renderer, {
				id,
				ref: contentImplState.opts.ref,
				enabled: true,
				onInteractOutside: (e) => {
					onInteractOutside(e);

					if (e.defaultPrevented) return;

					contentImplState.onInteractOutside(e);
				},

				onFocusOutside: (e) => {
					onFocusOutside(e);

					if (e.defaultPrevented) return;

					contentImplState.onFocusOutside(e);
				},
				interactOutsideBehavior,
				children,
				$$slots: { default: true }
			});
		}

		$.bind_props($$props, { ref });
	});
}