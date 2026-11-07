import * as $ from 'svelte/internal/server';
import { boxWith, mergeProps } from "svelte-toolbelt";
import { CollapsibleContentState } from "../collapsible.svelte.js";
import { createId } from "$lib/internal/create-id.js";

export default function Collapsible_content($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const uid = $.props_id($$renderer);

		let {
			child,
			ref = null,
			forceMount = false,
			hiddenUntilFound = false,
			children,
			id = createId(uid),
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const contentState = CollapsibleContentState.create({
			id: boxWith(() => id),
			forceMount: boxWith(() => forceMount),
			hiddenUntilFound: boxWith(() => hiddenUntilFound),
			ref: boxWith(() => ref, (v) => ref = v)
		});

		const mergedProps = $.derived(() => mergeProps(restProps, contentState.props));

		if (child) {
			$$renderer.push('<!--[0-->');
			child($$renderer, { ...contentState.snippetProps, props: mergedProps() });
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