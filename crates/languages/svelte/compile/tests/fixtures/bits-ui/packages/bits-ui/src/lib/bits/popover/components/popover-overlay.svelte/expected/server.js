import * as $ from 'svelte/internal/server';
import { boxWith, mergeProps } from "svelte-toolbelt";
import { PopoverOverlayState } from "../popover.svelte.js";
import { createId } from "$lib/internal/create-id.js";

export default function Popover_overlay($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const uid = $.props_id($$renderer);

		let {
			id = createId(uid),
			forceMount = false,
			child,
			children,
			ref = null,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const overlayState = PopoverOverlayState.create({
			id: boxWith(() => id),
			ref: boxWith(() => ref, (v) => ref = v)
		});

		const mergedProps = $.derived(() => mergeProps(restProps, overlayState.props));

		if (overlayState.shouldRender || forceMount) {
			$$renderer.push('<!--[0-->');

			if (child) {
				$$renderer.push('<!--[0-->');

				child($$renderer, {
					props: mergeProps(mergedProps()),
					...overlayState.snippetProps
				});

				$$renderer.push(`<!---->`);
			} else {
				$$renderer.push(`<!--[-1--><div${$.attributes({ ...mergeProps(mergedProps()) })}>`);
				children?.($$renderer, overlayState.snippetProps);
				$$renderer.push(`<!----></div>`);
			}

			$$renderer.push(`<!--]-->`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
		$.bind_props($$props, { ref });
	});
}