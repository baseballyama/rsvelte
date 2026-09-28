import * as $ from 'svelte/internal/server';
import { boxWith, mergeProps } from "svelte-toolbelt";
import { ScrollAreaCornerImplState } from "../scroll-area.svelte.js";

export default function Scroll_area_corner_impl($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref = null,
			id,
			children,
			child,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const cornerState = ScrollAreaCornerImplState.create({
			id: boxWith(() => id),
			ref: boxWith(() => ref, (v) => ref = v)
		});

		const mergedProps = $.derived(() => mergeProps(restProps, cornerState.props));

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