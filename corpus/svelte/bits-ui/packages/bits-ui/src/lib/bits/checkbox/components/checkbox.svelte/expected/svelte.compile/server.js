import * as $ from 'svelte/internal/server';
import { boxWith, mergeProps } from "svelte-toolbelt";
import { CheckboxGroupContext, CheckboxRootState } from "../checkbox.svelte.js";
import CheckboxInput from "./checkbox-input.svelte";
import { createId } from "$lib/internal/create-id.js";
import { watch } from "runed";

export default function Checkbox($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const uid = $.props_id($$renderer);

		let {
			checked = false,
			ref = null,
			onCheckedChange,
			children,
			disabled = false,
			required = false,
			name = undefined,
			form = undefined,
			value = "on",
			id = createId(uid),
			indeterminate = false,
			onIndeterminateChange,
			child,
			type = "button",
			readonly,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const group = CheckboxGroupContext.getOr(null);

		if (group && value) {
			if (group.opts.value.current.includes(value)) {
				checked = true;
			} else {
				checked = false;
			}
		}

		watch.pre(() => value, () => {
			if (group && value) {
				if (group.opts.value.current.includes(value)) {
					checked = true;
				} else {
					checked = false;
				}
			}
		});

		const rootState = CheckboxRootState.create(
			{
				checked: boxWith(() => checked, (v) => {
					checked = v;
					onCheckedChange?.(v);
				}),
				disabled: boxWith(() => disabled ?? false),
				required: boxWith(() => required),
				name: boxWith(() => name),
				form: boxWith(() => form),
				value: boxWith(() => value),
				id: boxWith(() => id),
				ref: boxWith(() => ref, (v) => ref = v),
				indeterminate: boxWith(() => indeterminate, (v) => {
					indeterminate = v;
					onIndeterminateChange?.(v);
				}),
				type: boxWith(() => type),
				readonly: boxWith(() => Boolean(readonly))
			},
			group
		);

		const mergedProps = $.derived(() => mergeProps({ ...restProps }, rootState.props));

		if (child) {
			$$renderer.push('<!--[0-->');
			child($$renderer, { props: mergedProps(), ...rootState.snippetProps });
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push(`<!--[-1--><button${$.attributes({ ...mergedProps() })}>`);
			children?.($$renderer, rootState.snippetProps);
			$$renderer.push(`<!----></button>`);
		}

		$$renderer.push(`<!--]--> `);
		CheckboxInput($$renderer, {});
		$$renderer.push(`<!---->`);
		$.bind_props($$props, { checked, ref, indeterminate });
	});
}