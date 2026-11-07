import * as $ from 'svelte/internal/server';
import { boxWith, mergeProps } from "svelte-toolbelt";
import { SwitchRootState } from "../switch.svelte.js";
import SwitchInput from "./switch-input.svelte";
import { createId } from "$lib/internal/create-id.js";
import { noop } from "$lib/internal/noop.js";

export default function Switch($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const uid = $.props_id($$renderer);

		let {
			child,
			children,
			ref = null,
			id = createId(uid),
			disabled = false,
			required = false,
			checked = false,
			value = "on",
			name = undefined,
			type = "button",
			onCheckedChange = noop,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const rootState = SwitchRootState.create({
			checked: boxWith(() => checked, (v) => {
				checked = v;
				onCheckedChange?.(v);
			}),
			disabled: boxWith(() => disabled ?? false),
			required: boxWith(() => required),
			value: boxWith(() => value),
			name: boxWith(() => name),
			id: boxWith(() => id),
			ref: boxWith(() => ref, (v) => ref = v)
		});

		const mergedProps = $.derived(() => mergeProps(restProps, rootState.props, { type }));

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
		SwitchInput($$renderer, {});
		$$renderer.push(`<!---->`);
		$.bind_props($$props, { ref, checked });
	});
}