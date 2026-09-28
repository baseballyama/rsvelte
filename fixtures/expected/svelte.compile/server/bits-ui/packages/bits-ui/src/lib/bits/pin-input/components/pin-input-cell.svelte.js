import * as $ from 'svelte/internal/server';
import { boxWith, mergeProps } from "svelte-toolbelt";
import { PinInputCellState } from "../pin-input.svelte.js";
import { createId } from "$lib/internal/create-id.js";

export default function Pin_input_cell($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const uid = $.props_id($$renderer);

		let {
			id = createId(uid),
			ref = null,
			cell,
			child,
			children,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const cellState = PinInputCellState.create({
			id: boxWith(() => id),
			ref: boxWith(() => ref, (v) => ref = v),
			cell: boxWith(() => cell)
		});

		const mergedProps = $.derived(() => mergeProps(restProps, cellState.props));

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