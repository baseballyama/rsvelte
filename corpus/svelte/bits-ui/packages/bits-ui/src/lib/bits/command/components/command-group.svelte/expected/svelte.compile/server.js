import * as $ from 'svelte/internal/server';
import { boxWith, mergeProps } from "svelte-toolbelt";
import { CommandGroupContainerState } from "../command.svelte.js";
import { createId } from "$lib/internal/create-id.js";

export default function Command_group($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const uid = $.props_id($$renderer);

		let {
			id = createId(uid),
			ref = null,
			value = "",
			forceMount = false,
			children,
			child,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const groupState = CommandGroupContainerState.create({
			id: boxWith(() => id),
			ref: boxWith(() => ref, (v) => ref = v),
			forceMount: boxWith(() => forceMount),
			value: boxWith(() => value)
		});

		const mergedProps = $.derived(() => mergeProps(restProps, groupState.props));

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