import * as $ from 'svelte/internal/server';
import { boxWith, mergeProps } from "svelte-toolbelt";
import { ScrollAreaRootState } from "../scroll-area.svelte.js";
import { createId } from "$lib/internal/create-id.js";

export default function Scroll_area($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const uid = $.props_id($$renderer);

		let {
			ref = null,
			id = createId(uid),
			type = "hover",
			dir = "ltr",
			scrollHideDelay = 600,
			children,
			child,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const rootState = ScrollAreaRootState.create({
			type: boxWith(() => type),
			dir: boxWith(() => dir),
			scrollHideDelay: boxWith(() => scrollHideDelay),
			id: boxWith(() => id),
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

		$$renderer.push(`<!--]-->`);
		$.bind_props($$props, { ref });
	});
}