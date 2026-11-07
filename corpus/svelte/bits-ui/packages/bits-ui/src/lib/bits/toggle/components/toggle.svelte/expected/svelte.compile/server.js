import * as $ from 'svelte/internal/server';
import { boxWith, mergeProps } from "svelte-toolbelt";
import { ToggleRootState } from "../toggle.svelte.js";
import { createId } from "$lib/internal/create-id.js";
import { noop } from "$lib/internal/noop.js";

export default function Toggle($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const uid = $.props_id($$renderer);

		let {
			ref = null,
			id = createId(uid),
			pressed = false,
			onPressedChange = noop,
			disabled = false,
			type = "button",
			children,
			child,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const toggleState = ToggleRootState.create({
			pressed: boxWith(() => pressed, (v) => {
				pressed = v;
				onPressedChange(v);
			}),
			disabled: boxWith(() => disabled ?? false),
			id: boxWith(() => id),
			ref: boxWith(() => ref, (v) => ref = v)
		});

		const mergedProps = $.derived(() => mergeProps(restProps, toggleState.props, { type }));

		if (child) {
			$$renderer.push('<!--[0-->');
			child($$renderer, { props: mergedProps(), ...toggleState.snippetProps });
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push(`<!--[-1--><button${$.attributes({ ...mergedProps() })}>`);
			children?.($$renderer, toggleState.snippetProps);
			$$renderer.push(`<!----></button>`);
		}

		$$renderer.push(`<!--]-->`);
		$.bind_props($$props, { ref, pressed });
	});
}