import * as $ from 'svelte/internal/server';
import { boxWith, mergeProps } from "svelte-toolbelt";
import { AspectRatioRootState } from "../aspect-ratio.svelte.js";
import { createId } from "$lib/internal/create-id.js";

export default function Aspect_ratio($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const uid = $.props_id($$renderer);

		let {
			ref = null,
			id = createId(uid),
			ratio = 1,
			children,
			child,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const rootState = AspectRatioRootState.create({
			id: boxWith(() => id),
			ref: boxWith(() => ref, (v) => ref = v),
			ratio: boxWith(() => ratio)
		});

		const mergedProps = $.derived(() => mergeProps(restProps, rootState.props));

		$$renderer.push(`<div${$.attr_style('', {
			position: 'relative',
			width: '100%',
			'padding-bottom': `${$.stringify(ratio ? 100 / ratio : 0)}%`
		})}>`);

		if (child) {
			$$renderer.push('<!--[0-->');
			child($$renderer, { props: mergedProps() });
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push(`<!--[-1--><div${$.attributes({ ...mergedProps() })}>`);
			children?.($$renderer);
			$$renderer.push(`<!----></div>`);
		}

		$$renderer.push(`<!--]--></div>`);
		$.bind_props($$props, { ref });
	});
}