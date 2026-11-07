import * as $ from 'svelte/internal/server';
import { boxWith, mergeProps } from "svelte-toolbelt";
import { ToolbarRootState } from "../toolbar.svelte.js";
import { createId } from "$lib/internal/create-id.js";

export default function Toolbar($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const uid = $.props_id($$renderer);

		let {
			ref = null,
			id = createId(uid),
			orientation = "horizontal",
			loop = true,
			child,
			children,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const rootState = ToolbarRootState.create({
			id: boxWith(() => id),
			orientation: boxWith(() => orientation),
			loop: boxWith(() => loop),
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