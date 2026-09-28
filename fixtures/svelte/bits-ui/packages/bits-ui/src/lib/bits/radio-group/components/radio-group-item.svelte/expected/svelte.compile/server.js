import * as $ from 'svelte/internal/server';
import { boxWith, mergeProps } from "svelte-toolbelt";
import { RadioGroupItemState } from "../radio-group.svelte.js";
import { createId } from "$lib/internal/create-id.js";

export default function Radio_group_item($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const uid = $.props_id($$renderer);

		let {
			id = createId(uid),
			children,
			child,
			value,
			disabled = false,
			ref = null,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const itemState = RadioGroupItemState.create({
			value: boxWith(() => value),
			disabled: boxWith(() => disabled ?? false),
			id: boxWith(() => id),
			ref: boxWith(() => ref, (v) => ref = v)
		});

		const mergedProps = $.derived(() => mergeProps(restProps, itemState.props));

		if (child) {
			$$renderer.push('<!--[0-->');
			child($$renderer, { props: mergedProps(), ...itemState.snippetProps });
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push(`<!--[-1--><button${$.attributes({ ...mergedProps() })}>`);
			children?.($$renderer, itemState.snippetProps);
			$$renderer.push(`<!----></button>`);
		}

		$$renderer.push(`<!--]-->`);
		$.bind_props($$props, { ref });
	});
}