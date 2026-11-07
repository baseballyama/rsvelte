import * as $ from 'svelte/internal/server';
import { boxWith, mergeProps } from "svelte-toolbelt";
import { DropdownMenuTriggerState } from "../menu.svelte.js";
import { createId } from "$lib/internal/create-id.js";
import FloatingLayerAnchor from "$lib/bits/utilities/floating-layer/components/floating-layer-anchor.svelte";

export default function Menu_trigger($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const uid = $.props_id($$renderer);

		let {
			id = createId(uid),
			ref = null,
			child,
			children,
			disabled = false,
			type = "button",
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const triggerState = DropdownMenuTriggerState.create({
			id: boxWith(() => id),
			disabled: boxWith(() => disabled ?? false),
			ref: boxWith(() => ref, (v) => ref = v)
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