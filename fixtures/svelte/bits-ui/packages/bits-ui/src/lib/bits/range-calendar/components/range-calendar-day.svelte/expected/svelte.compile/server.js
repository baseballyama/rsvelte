import * as $ from 'svelte/internal/server';
import { boxWith, mergeProps } from "svelte-toolbelt";
import { RangeCalendarDayState } from "../range-calendar.svelte.js";
import { createId } from "$lib/internal/create-id.js";

export default function Range_calendar_day($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const uid = $.props_id($$renderer);

		let {
			children,
			child,
			id = createId(uid),
			ref = null,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const dayState = RangeCalendarDayState.create({
			id: boxWith(() => id),
			ref: boxWith(() => ref, (v) => ref = v)
		});

		const mergedProps = $.derived(() => mergeProps(restProps, dayState.props));

		if (child) {
			$$renderer.push('<!--[0-->');
			child($$renderer, { props: mergedProps(), ...dayState.snippetProps });
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push(`<!--[-1--><div${$.attributes({ ...mergedProps() })}>`);

			if (children) {
				$$renderer.push('<!--[0-->');
				children?.($$renderer, dayState.snippetProps);
				$$renderer.push(`<!---->`);
			} else {
				$$renderer.push(`<!--[-1-->${$.escape(dayState.cell.opts.date.current.day)}`);
			}

			$$renderer.push(`<!--]--></div>`);
		}

		$$renderer.push(`<!--]-->`);
		$.bind_props($$props, { ref });
	});
}