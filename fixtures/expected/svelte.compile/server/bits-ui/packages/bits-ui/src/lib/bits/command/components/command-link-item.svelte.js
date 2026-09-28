import * as $ from 'svelte/internal/server';
import { boxWith, mergeProps } from "svelte-toolbelt";
import { CommandItemState } from "../command.svelte.js";
import { noop } from "$lib/internal/noop.js";
import { createId } from "$lib/internal/create-id.js";

export default function Command_link_item($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const uid = $.props_id($$renderer);

		let {
			id = createId(uid),
			ref = null,
			value = "",
			disabled = false,
			children,
			child,
			onSelect = noop,
			forceMount = false,
			keywords = [],
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const itemState = CommandItemState.create({
			id: boxWith(() => id),
			ref: boxWith(() => ref, (v) => ref = v),
			value: boxWith(() => value),
			disabled: boxWith(() => disabled),
			onSelect: boxWith(() => onSelect),
			forceMount: boxWith(() => forceMount),
			keywords: boxWith(() => keywords)
		});

		const mergedProps = $.derived(() => mergeProps(restProps, itemState.props));

		$$renderer.push(`<!---->`);

		{
			$$renderer.push(`<div style="display: contents;">`);

			if (itemState.shouldRender) {
				$$renderer.push('<!--[0-->');

				if (child) {
					$$renderer.push('<!--[0-->');
					child($$renderer, { props: mergedProps() });
					$$renderer.push(`<!---->`);
				} else {
					$$renderer.push(`<!--[-1--><a${$.attributes({ ...mergedProps() })}>`);
					children?.($$renderer);
					$$renderer.push(`<!----></a>`);
				}

				$$renderer.push(`<!--]-->`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div>`);
		}

		$$renderer.push(`<!---->`);
		$.bind_props($$props, { ref });
	});
}