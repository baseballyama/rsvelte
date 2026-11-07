import * as $ from 'svelte/internal/server';
import { boxWith, mergeProps } from "svelte-toolbelt";
import { SwitchThumbState } from "../switch.svelte.js";
import { createId } from "$lib/internal/create-id.js";

export default function Switch_thumb($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const uid = $.props_id($$renderer);

		let {
			child,
			children,
			ref = null,
			id = createId(uid),
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const thumbState = SwitchThumbState.create({
			id: boxWith(() => id),
			ref: boxWith(() => ref, (v) => ref = v)
		});

		const mergedProps = $.derived(() => mergeProps(restProps, thumbState.props));

		if (child) {
			$$renderer.push('<!--[0-->');
			child($$renderer, { props: mergedProps(), ...thumbState.snippetProps });
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push(`<!--[-1--><span${$.attributes({ ...mergedProps() })}>`);
			children?.($$renderer, thumbState.snippetProps);
			$$renderer.push(`<!----></span>`);
		}

		$$renderer.push(`<!--]-->`);
		$.bind_props($$props, { ref });
	});
}