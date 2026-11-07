import * as $ from 'svelte/internal/server';
import { boxWith, mergeProps } from "svelte-toolbelt";
import { CalendarMonthSelectState } from "../calendar.svelte.js";
import { createId } from "$lib/internal/create-id.js";

export default function Calendar_month_select($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const uid = $.props_id($$renderer);

		let {
			children,
			child,
			ref = null,
			id = createId(uid),
			months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
			monthFormat = "long",
			disabled = false,
			"aria-label": ariaLabel = "Select a month",
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const monthSelectState = CalendarMonthSelectState.create({
			id: boxWith(() => id),
			ref: boxWith(() => ref, (v) => ref = v),
			months: boxWith(() => months),
			monthFormat: boxWith(() => monthFormat),
			disabled: boxWith(() => Boolean(disabled))
		});

		const mergedProps = $.derived(() => mergeProps(restProps, monthSelectState.props, { "aria-label": ariaLabel }));

		if (child) {
			$$renderer.push('<!--[0-->');
			child($$renderer, { props: mergedProps(), ...monthSelectState.snippetProps });
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push('<!--[-1-->');

			$$renderer.select(
				{ ...mergedProps() },
				($$renderer) => {
					if (children) {
						$$renderer.push('<!--[0-->');
						children?.($$renderer, monthSelectState.snippetProps);
						$$renderer.push(`<!---->`);
					} else {
						$$renderer.push(`<!--[-1--><!--[-->`);

						const each_array = $.ensure_array_like(monthSelectState.monthItems);

						for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
							let month = each_array[$$index];

							$$renderer.option(
								{
									value: month.value,
									selected: month.value === monthSelectState.currentMonth
								},
								($$renderer) => {
									$$renderer.push(`${$.escape(month.label)}`);
								}
							);
						}

						$$renderer.push(`<!--]-->`);
					}

					$$renderer.push(`<!--]-->`);
				},
				void 0,
				void 0,
				void 0,
				void 0,
				true
			);
		}

		$$renderer.push(`<!--]-->`);
		$.bind_props($$props, { ref });
	});
}