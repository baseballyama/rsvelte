import * as $ from 'svelte/internal/server';
import { mergeProps, boxWith } from "svelte-toolbelt";
import { AccordionContentState } from "../accordion.svelte.js";
import { createId } from "$lib/internal/create-id.js";

export default function Accordion_content($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const uid = $.props_id($$renderer);

		let {
			child,
			ref = null,
			id = createId(uid),
			forceMount = false,
			children,
			hiddenUntilFound = false,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const contentState = AccordionContentState.create({
			forceMount: boxWith(() => forceMount),
			id: boxWith(() => id),
			ref: boxWith(() => ref, (v) => ref = v),
			hiddenUntilFound: boxWith(() => hiddenUntilFound)
		});

		const mergedProps = $.derived(() => mergeProps(restProps, contentState.props));

		if (child) {
			$$renderer.push('<!--[0-->');
			child($$renderer, { props: mergedProps(), ...contentState.snippetProps });
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