import * as $ from 'svelte/internal/server';
import { boxWith, mergeProps } from "svelte-toolbelt";
import { MenuSubTriggerState } from "../menu.svelte.js";
import FloatingLayerAnchor from "$lib/bits/utilities/floating-layer/components/floating-layer-anchor.svelte";
import { noop } from "$lib/internal/noop.js";
import { createId } from "$lib/internal/create-id.js";

export default function Menu_sub_trigger($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const uid = $.props_id($$renderer);

		let {
			id = createId(uid),
			disabled = false,
			ref = null,
			children,
			child,
			onSelect = noop,
			openDelay = 0,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const subTriggerState = MenuSubTriggerState.create({
			disabled: boxWith(() => disabled),
			onSelect: boxWith(() => onSelect),
			id: boxWith(() => id),
			ref: boxWith(() => ref, (v) => ref = v),
			openDelay: boxWith(() => openDelay)
		});

		const mergedProps = $.derived(() => mergeProps(restProps, subTriggerState.props));

		FloatingLayerAnchor($$renderer, {
			id,
			ref: subTriggerState.opts.ref,
			children: ($$renderer) => {
				if (child) {
					$$renderer.push('<!--[0-->');
					child($$renderer, { props: mergedProps() });
					$$renderer.push(`<!---->`);
				} else {
					$$renderer.push(`<!--[-1--><div${$.attributes({ ...mergedProps() })}>`);
					children?.($$renderer);
					$$renderer.push(`<!----></div>`);
				}

				$$renderer.push(`<!--]-->`);
			},
			$$slots: { default: true }
		});

		$.bind_props($$props, { ref });
	});
}