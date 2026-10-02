import * as $ from 'svelte/internal/server';
import { boxWith, mergeProps } from "svelte-toolbelt";
import { MenuCheckboxGroupState } from "../menu.svelte.js";
import { noop } from "$lib/internal/noop.js";
import { createId } from "$lib/internal/create-id.js";

export default function Menu_checkbox_group($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const uid = $.props_id($$renderer);

		let {
			id = createId(uid),
			children,
			child,
			ref = null,
			value = [],
			onValueChange = noop,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const checkboxGroupState = MenuCheckboxGroupState.create({
			value: boxWith(() => $.snapshot(value), (v) => {
				value = $.snapshot(v);
				onValueChange(v);
			}),
			onValueChange: boxWith(() => onValueChange),
			ref: boxWith(() => ref, (v) => ref = v),
			id: boxWith(() => id)
		});

		const mergedProps = $.derived(() => mergeProps(restProps, checkboxGroupState.props));

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
		$.bind_props($$props, { ref, value });
	});
}