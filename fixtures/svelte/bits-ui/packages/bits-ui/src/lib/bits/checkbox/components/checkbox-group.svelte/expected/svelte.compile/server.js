import * as $ from 'svelte/internal/server';
import { boxWith, mergeProps } from "svelte-toolbelt";
import { CheckboxGroupState } from "../checkbox.svelte.js";
import { noop } from "$lib/internal/noop.js";
import { createId } from "$lib/internal/create-id.js";
import { arraysAreEqual } from "$lib/internal/arrays.js";

export default function Checkbox_group($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const uid = $.props_id($$renderer);

		let {
			ref = null,
			id = createId(uid),
			value = [],
			onValueChange = noop,
			name,
			required,
			disabled,
			children,
			child,
			readonly,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const groupState = CheckboxGroupState.create({
			id: boxWith(() => id),
			ref: boxWith(() => ref, (v) => ref = v),
			disabled: boxWith(() => Boolean(disabled)),
			required: boxWith(() => Boolean(required)),
			readonly: boxWith(() => Boolean(readonly)),
			name: boxWith(() => name),
			value: boxWith(() => $.snapshot(value), (v) => {
				if (arraysAreEqual(value, v)) return;

				value = $.snapshot(v);
				onValueChange(v);
			}),
			onValueChange: boxWith(() => onValueChange)
		});

		const mergedProps = $.derived(() => mergeProps(restProps, groupState.props));

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