import * as $ from 'svelte/internal/server';
import { boxWith, mergeProps } from "svelte-toolbelt";
import { ScrollAreaViewportState } from "../scroll-area.svelte.js";
import { createId } from "$lib/internal/create-id.js";

export default function Scroll_area_viewport($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const uid = $.props_id($$renderer);

		let {
			ref = null,
			id = createId(uid),
			children,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const viewportState = ScrollAreaViewportState.create({
			id: boxWith(() => id),
			ref: boxWith(() => ref, (v) => ref = v)
		});

		const mergedProps = $.derived(() => mergeProps(restProps, viewportState.props));
		const mergedContentProps = $.derived(() => mergeProps({}, viewportState.contentProps));

		$$renderer.push(`<div${$.attributes({ ...mergedProps() })}><div${$.attributes({ ...mergedContentProps() })}>`);
		children?.($$renderer);
		$$renderer.push(`<!----></div></div>`);
		$.bind_props($$props, { ref });
	});
}