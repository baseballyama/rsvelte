import * as $ from 'svelte/internal/server';
import { boxWith, mergeProps } from "svelte-toolbelt";
import { PopoverTriggerState } from "../popover.svelte.js";
import { createId } from "$lib/internal/create-id.js";
import FloatingLayerAnchor from "$lib/bits/utilities/floating-layer/components/floating-layer-anchor.svelte";

export default function Popover_trigger($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const uid = $.props_id($$renderer);

		let {
			children,
			child,
			id = createId(uid),
			ref = null,
			type = "button",
			disabled = false,
			openOnHover = false,
			openDelay = 700,
			closeDelay = 300,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const triggerState = PopoverTriggerState.create({
			id: boxWith(() => id),
			ref: boxWith(() => ref, (v) => ref = v),
			disabled: boxWith(() => Boolean(disabled)),
			openOnHover: boxWith(() => openOnHover),
			openDelay: boxWith(() => openDelay),
			closeDelay: boxWith(() => closeDelay)
		});

		const mergedProps = $.derived(() => mergeProps(restProps, triggerState.props, { type }));

		FloatingLayerAnchor($$renderer, {
			id,
			ref: triggerState.opts.ref,
			children: ($$renderer) => {
				if (child) {
					$$renderer.push('<!--[0-->');
					child($$renderer, { props: mergedProps() });
					$$renderer.push(`<!---->`);
				} else {
					$$renderer.push(`<!--[-1--><button${$.attributes({ ...mergedProps() })}>`);
					children?.($$renderer);
					$$renderer.push(`<!----></button>`);
				}

				$$renderer.push(`<!--]-->`);
			},
			$$slots: { default: true }
		});

		$.bind_props($$props, { ref });
	});
}