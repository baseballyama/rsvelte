import * as $ from 'svelte/internal/server';
import { boxWith, mergeProps } from "svelte-toolbelt";
import { SliderThumbState } from "../slider.svelte.js";
import { createId } from "$lib/internal/create-id.js";

export default function Slider_thumb($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const uid = $.props_id($$renderer);

		let {
			children,
			child,
			ref = null,
			id = createId(uid),
			index,
			disabled = false,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const thumbState = SliderThumbState.create({
			id: boxWith(() => id),
			ref: boxWith(() => ref, (v) => ref = v),
			index: boxWith(() => index),
			disabled: boxWith(() => disabled)
		});

		const mergedProps = $.derived(() => mergeProps(restProps, thumbState.props));

		if (child) {
			$$renderer.push('<!--[0-->');

			child($$renderer, {
				active: thumbState.root.isThumbActive(thumbState.opts.index.current),
				props: mergedProps()
			});

			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push(`<!--[-1--><span${$.attributes({ ...mergedProps() })}>`);

			children?.($$renderer, {
				active: thumbState.root.isThumbActive(thumbState.opts.index.current)
			});

			$$renderer.push(`<!----></span>`);
		}

		$$renderer.push(`<!--]-->`);
		$.bind_props($$props, { ref });
	});
}