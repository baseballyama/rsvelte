import * as $ from 'svelte/internal/server';
import { boxWith, mergeProps } from "svelte-toolbelt";
import { CalendarYearSelectState } from "../calendar.svelte.js";
import { createId } from "$lib/internal/create-id.js";

export default function Calendar_year_select($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const uid = $.props_id($$renderer);

		let {
			children,
			child,
			ref = null,
			id = createId(uid),
			years,
			yearFormat = "numeric",
			disabled = false,
			"aria-label": ariaLabel = "Select a year",
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const yearSelectState = CalendarYearSelectState.create({
			id: boxWith(() => id),
			ref: boxWith(() => ref, (v) => ref = v),
			years: boxWith(() => years),
			yearFormat: boxWith(() => yearFormat),
			disabled: boxWith(() => Boolean(disabled))
		});

		const mergedProps = $.derived(() => mergeProps(restProps, yearSelectState.props, { "aria-label": ariaLabel }));

		if (child) {
			$$renderer.push('<!--[0-->');
			child($$renderer, { props: mergedProps(), ...yearSelectState.snippetProps });
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push('<!--[-1-->');

			$$renderer.select(
				{ ...mergedProps() },
				($$renderer) => {
					if (children) {
						$$renderer.push('<!--[0-->');
						children?.($$renderer, yearSelectState.snippetProps);
						$$renderer.push(`<!---->`);
					} else {
						$$renderer.push(`<!--[-1--><!--[-->`);

						const each_array = $.ensure_array_like(yearSelectState.yearItems);

						for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
							let year = each_array[$$index];

							$$renderer.option(
								{
									value: year.value,
									selected: year.value === yearSelectState.currentYear
								},
								($$renderer) => {
									$$renderer.push(`${$.escape(year.label)}`);
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