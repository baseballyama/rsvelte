import * as $ from 'svelte/internal/server';
import { boxWith, mergeProps } from "svelte-toolbelt";
import { SliderTickState } from "../slider.svelte.js";
import { createId } from "$lib/internal/create-id.js";

export default function Slider_tick($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const uid = $.props_id($$renderer);

		let {
			children,
			child,
			ref = null,
			id = createId(uid),
			index,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const tickState = SliderTickState.create({
			id: boxWith(() => id),
			ref: boxWith(() => ref, (v) => ref = v),
			index: boxWith(() => index)
		});

		const mergedProps = $.derived(() => mergeProps(restProps, tickState.props));

		if (child) {
			$$renderer.push('<!--[0-->');
			child($$renderer, { props: mergedProps() });
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push(`<!--[-1--><span${$.attributes({ ...mergedProps() })}>`);
			children?.($$renderer);
			$$renderer.push(`<!----></span>`);
		}

		$$renderer.push(`<!--]-->`);
		$.bind_props($$props, { ref });
	});
}