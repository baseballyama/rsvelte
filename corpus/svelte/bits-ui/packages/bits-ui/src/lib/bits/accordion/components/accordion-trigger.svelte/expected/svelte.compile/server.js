import * as $ from 'svelte/internal/server';
import { boxWith, mergeProps } from "svelte-toolbelt";
import { AccordionTriggerState } from "../accordion.svelte.js";
import { createId } from "$lib/internal/create-id.js";

export default function Accordion_trigger($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const uid = $.props_id($$renderer);

		let {
			disabled = false,
			ref = null,
			id = createId(uid),
			tabindex = 0,
			children,
			child,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const triggerState = AccordionTriggerState.create({
			disabled: boxWith(() => disabled),
			id: boxWith(() => id),
			tabindex: boxWith(() => tabindex ?? 0),
			ref: boxWith(() => ref, (v) => ref = v)
		});

		const mergedProps = $.derived(() => mergeProps(restProps, triggerState.props));

		if (child) {
			$$renderer.push('<!--[0-->');
			child($$renderer, { props: mergedProps() });
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push(`<!--[-1--><button${$.attributes({ type: 'button', ...mergedProps() })}>`);
			children?.($$renderer);
			$$renderer.push(`<!----></button>`);
		}

		$$renderer.push(`<!--]-->`);
		$.bind_props($$props, { ref });
	});
}