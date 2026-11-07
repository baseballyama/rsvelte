import * as $ from 'svelte/internal/server';
import { boxWith, mergeProps } from "svelte-toolbelt";
import { ToolbarButtonState } from "../toolbar.svelte.js";
import { createId } from "$lib/internal/create-id.js";

export default function Toolbar_button($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const uid = $.props_id($$renderer);

		let {
			child,
			children,
			disabled = false,
			type = "button",
			id = createId(uid),
			ref = null,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const buttonState = ToolbarButtonState.create({
			id: boxWith(() => id),
			disabled: boxWith(() => disabled ?? false),
			ref: boxWith(() => ref, (v) => ref = v)
		});

		const mergedProps = $.derived(() => mergeProps(restProps, buttonState.props, { type }));

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
		$.bind_props($$props, { ref });
	});
}