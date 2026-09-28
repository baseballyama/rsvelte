import * as $ from 'svelte/internal/server';
import { attachRef, boxWith, mergeProps } from "svelte-toolbelt";
import { MenubarTriggerState } from "../menubar.svelte.js";
import { createId } from "$lib/internal/create-id.js";
import FloatingLayerAnchor from "$lib/bits/utilities/floating-layer/components/floating-layer-anchor.svelte";
import { DropdownMenuTriggerState } from "$lib/bits/menu/menu.svelte.js";

export default function Menubar_trigger($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const uid = $.props_id($$renderer);

		let {
			id = createId(uid),
			disabled = false,
			children,
			child,
			ref = null,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const triggerState = MenubarTriggerState.create({
			id: boxWith(() => id),
			disabled: boxWith(() => disabled ?? false),
			ref: boxWith(() => ref, (v) => ref = v)
		});

		const dropdownTriggerState = DropdownMenuTriggerState.create(triggerState.opts);
		const triggerAttachment = attachRef((v) => dropdownTriggerState.parentMenu.triggerNode = v);
		const mergedProps = $.derived(() => mergeProps(restProps, triggerState.props, { ...triggerAttachment }));

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