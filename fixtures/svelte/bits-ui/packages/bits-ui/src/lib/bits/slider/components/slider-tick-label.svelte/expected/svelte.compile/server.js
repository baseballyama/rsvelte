import * as $ from 'svelte/internal/server';
import { boxWith, mergeProps } from "svelte-toolbelt";
import { SliderRootContext, SliderTickLabelState } from "../slider.svelte.js";
import { createId } from "$lib/internal/create-id.js";

export default function Slider_tick_label($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const uid = $.props_id($$renderer);

		let {
			children,
			child,
			ref = null,
			id = createId(uid),
			index,
			position: positionProp,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const root = SliderRootContext.get();

		const position = $.derived(() => {
			if (positionProp !== undefined) return positionProp;

			switch (root.direction) {
				case "lr":

				case "rl":
					return "top";

				case "tb":

				case "bt":
					return "left";
			}
		});

		const tickLabelState = SliderTickLabelState.create({
			id: boxWith(() => id),
			ref: boxWith(() => ref, (v) => ref = v),
			index: boxWith(() => index),
			position: boxWith(() => position())
		});

		const mergedProps = $.derived(() => mergeProps(restProps, tickLabelState.props));

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