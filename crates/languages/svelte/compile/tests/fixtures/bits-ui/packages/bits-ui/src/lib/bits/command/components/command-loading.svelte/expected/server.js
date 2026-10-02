import * as $ from 'svelte/internal/server';
import { boxWith, mergeProps } from "svelte-toolbelt";
import { CommandLoadingState } from "../command.svelte.js";
import { createId } from "$lib/internal/create-id.js";

export default function Command_loading($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const uid = $.props_id($$renderer);

		let {
			progress = 0,
			id = createId(uid),
			ref = null,
			children,
			child,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const loadingState = CommandLoadingState.create({
			id: boxWith(() => id),
			ref: boxWith(() => ref, (v) => ref = v),
			progress: boxWith(() => progress)
		});

		const mergedProps = $.derived(() => mergeProps(restProps, loadingState.props));

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