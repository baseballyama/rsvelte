import * as $ from 'svelte/internal/server';
import { boxWith, mergeProps } from "svelte-toolbelt";
import { IsMounted } from "runed";
import { ScrollAreaThumbImplState } from "../scroll-area.svelte.js";

export default function Scroll_area_thumb_impl($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref = null,
			id,
			child,
			children,
			present,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const isMounted = new IsMounted();

		const thumbState = ScrollAreaThumbImplState.create({
			id: boxWith(() => id),
			ref: boxWith(() => ref, (v) => ref = v),
			mounted: boxWith(() => isMounted.current)
		});

		const mergedProps = $.derived(() => mergeProps(restProps, thumbState.props, { style: { hidden: !present } }));

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