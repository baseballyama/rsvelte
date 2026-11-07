import * as $ from 'svelte/internal/server';
import { boxWith, mergeProps } from "svelte-toolbelt";
import { RadioGroupRootState } from "../radio-group.svelte.js";
import RadioGroupInput from "./radio-group-input.svelte";
import { createId } from "$lib/internal/create-id.js";
import { noop } from "$lib/internal/noop.js";

export default function Radio_group($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const uid = $.props_id($$renderer);

		let {
			disabled = false,
			children,
			child,
			value = "",
			ref = null,
			orientation = "vertical",
			loop = true,
			name = undefined,
			required = false,
			readonly = false,
			id = createId(uid),
			onValueChange = noop,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const rootState = RadioGroupRootState.create({
			orientation: boxWith(() => orientation),
			disabled: boxWith(() => disabled),
			loop: boxWith(() => loop),
			name: boxWith(() => name),
			required: boxWith(() => required),
			readonly: boxWith(() => readonly),
			id: boxWith(() => id),
			value: boxWith(() => value, (v) => {
				if (v === value) return;

				value = v;
				onValueChange?.(v);
			}),
			ref: boxWith(() => ref, (v) => ref = v)
		});

		const mergedProps = $.derived(() => mergeProps(restProps, rootState.props));

		if (child) {
			$$renderer.push('<!--[0-->');
			child($$renderer, { props: mergedProps() });
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push(`<!--[-1--><div${$.attributes({ ...mergedProps() })}>`);
			children?.($$renderer);
			$$renderer.push(`<!----></div>`);
		}

		$$renderer.push(`<!--]--> `);
		RadioGroupInput($$renderer, {});
		$$renderer.push(`<!---->`);
		$.bind_props($$props, { value, ref });
	});
}