import * as $ from 'svelte/internal/server';
import { boxWith, mergeProps } from "svelte-toolbelt";
import { CalendarCellState } from "../calendar.svelte.js";
import { createId } from "$lib/internal/create-id.js";

export default function Calendar_cell($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const uid = $.props_id($$renderer);

		let {
			children,
			child,
			ref = null,
			id = createId(uid),
			date,
			month,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const cellState = CalendarCellState.create({
			id: boxWith(() => id),
			ref: boxWith(() => ref, (v) => ref = v),
			date: boxWith(() => date),
			month: boxWith(() => month)
		});

		const mergedProps = $.derived(() => mergeProps(restProps, cellState.props));

		if (child) {
			$$renderer.push('<!--[0-->');
			child($$renderer, { props: mergedProps(), ...cellState.snippetProps });
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push(`<!--[-1--><td${$.attributes({ ...mergedProps() })}>`);
			children?.($$renderer, cellState.snippetProps);
			$$renderer.push(`<!----></td>`);
		}

		$$renderer.push(`<!--]-->`);
		$.bind_props($$props, { ref });
	});
}