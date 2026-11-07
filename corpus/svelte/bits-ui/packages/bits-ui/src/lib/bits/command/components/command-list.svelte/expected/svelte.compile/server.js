import * as $ from 'svelte/internal/server';
import { boxWith, mergeProps } from "svelte-toolbelt";
import { CommandListState } from "../command.svelte.js";
import { createId } from "$lib/internal/create-id.js";

export default function Command_list($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const uid = $.props_id($$renderer);

		let {
			id = createId(uid),
			ref = null,
			child,
			children,
			"aria-label": ariaLabel,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const listState = CommandListState.create({
			id: boxWith(() => id),
			ref: boxWith(() => ref, (v) => ref = v),
			ariaLabel: boxWith(() => ariaLabel ?? "Suggestions...")
		});

		const mergedProps = $.derived(() => mergeProps(restProps, listState.props));

		$$renderer.push(`<!---->`);

		{
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
		}

		$$renderer.push(`<!---->`);
		$.bind_props($$props, { ref });
	});
}