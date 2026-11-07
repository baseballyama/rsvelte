import * as $ from 'svelte/internal/server';
import { boxWith, mergeProps } from "svelte-toolbelt";
import { DateRangePickerRootContext } from "../date-range-picker.svelte.js";
import { createId } from "$lib/internal/create-id.js";
import { RangeCalendarRootState } from "$lib/bits/range-calendar/range-calendar.svelte.js";

export default function Date_range_picker_calendar($$renderer, $$props) {
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

		const dateRangePickerRootState = DateRangePickerRootContext.get();

		const rangeCalendarState = RangeCalendarRootState.create({
			id: boxWith(() => id),
			ref: boxWith(() => ref, (v) => ref = v),
			calendarLabel: dateRangePickerRootState.opts.calendarLabel,
			fixedWeeks: dateRangePickerRootState.opts.fixedWeeks,
			isDateDisabled: dateRangePickerRootState.opts.isDateDisabled,
			isDateUnavailable: dateRangePickerRootState.opts.isDateUnavailable,
			locale: dateRangePickerRootState.opts.locale,
			numberOfMonths: dateRangePickerRootState.opts.numberOfMonths,
			pagedNavigation: dateRangePickerRootState.opts.pagedNavigation,
			preventDeselect: dateRangePickerRootState.opts.preventDeselect,
			readonly: dateRangePickerRootState.opts.readonly,
			weekStartsOn: dateRangePickerRootState.opts.weekStartsOn,
			weekdayFormat: dateRangePickerRootState.opts.weekdayFormat,
			disabled: dateRangePickerRootState.opts.disabled,
			disableDaysOutsideMonth: dateRangePickerRootState.opts.disableDaysOutsideMonth,
			maxValue: dateRangePickerRootState.opts.maxValue,
			minValue: dateRangePickerRootState.opts.minValue,
			placeholder: dateRangePickerRootState.opts.placeholder,
			value: dateRangePickerRootState.opts.value,
			excludeDisabled: dateRangePickerRootState.opts.excludeDisabled,
			onRangeSelect: dateRangePickerRootState.opts.onRangeSelect,
			startValue: dateRangePickerRootState.opts.startValue,
			endValue: dateRangePickerRootState.opts.endValue,
			defaultPlaceholder: dateRangePickerRootState.opts.defaultPlaceholder,
			minDays: dateRangePickerRootState.opts.minDays,
			maxDays: dateRangePickerRootState.opts.maxDays,
			monthFormat: dateRangePickerRootState.opts.monthFormat,
			yearFormat: dateRangePickerRootState.opts.yearFormat
		});

		const mergedProps = $.derived(() => mergeProps(restProps, rangeCalendarState.props));

		if (child) {
			$$renderer.push('<!--[0-->');
			child($$renderer, { props: mergedProps(), ...rangeCalendarState.snippetProps });
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push(`<!--[-1--><div${$.attributes({ ...mergedProps() })}>`);
			children?.($$renderer, rangeCalendarState.snippetProps);
			$$renderer.push(`<!----></div>`);
		}

		$$renderer.push(`<!--]-->`);
		$.bind_props($$props, { ref });
	});
}