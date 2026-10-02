import * as $ from 'svelte/internal/server';
import { boxWith, mergeProps } from "svelte-toolbelt";
import { DatePickerRootContext } from "../date-picker.svelte.js";
import { CalendarRootState } from "$lib/bits/calendar/calendar.svelte.js";
import { createId } from "$lib/internal/create-id.js";

export default function Date_picker_calendar($$renderer, $$props) {
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

		const datePickerRootState = DatePickerRootContext.get();

		const calendarState = CalendarRootState.create({
			id: boxWith(() => id),
			ref: boxWith(() => ref, (v) => ref = v),
			calendarLabel: datePickerRootState.opts.calendarLabel,
			fixedWeeks: datePickerRootState.opts.fixedWeeks,
			isDateDisabled: datePickerRootState.opts.isDateDisabled,
			isDateUnavailable: datePickerRootState.opts.isDateUnavailable,
			locale: datePickerRootState.opts.locale,
			numberOfMonths: datePickerRootState.opts.numberOfMonths,
			pagedNavigation: datePickerRootState.opts.pagedNavigation,
			preventDeselect: datePickerRootState.opts.preventDeselect,
			readonly: datePickerRootState.opts.readonly,
			type: boxWith(() => "single"),
			weekStartsOn: datePickerRootState.opts.weekStartsOn,
			weekdayFormat: datePickerRootState.opts.weekdayFormat,
			disabled: datePickerRootState.opts.disabled,
			disableDaysOutsideMonth: datePickerRootState.opts.disableDaysOutsideMonth,
			maxValue: datePickerRootState.opts.maxValue,
			minValue: datePickerRootState.opts.minValue,
			placeholder: datePickerRootState.opts.placeholder,
			value: datePickerRootState.opts.value,
			onDateSelect: datePickerRootState.opts.onDateSelect,
			initialFocus: datePickerRootState.opts.initialFocus,
			defaultPlaceholder: datePickerRootState.opts.defaultPlaceholder,
			maxDays: boxWith(() => undefined),
			monthFormat: datePickerRootState.opts.monthFormat,
			yearFormat: datePickerRootState.opts.yearFormat
		});

		const mergedProps = $.derived(() => mergeProps(restProps, calendarState.props));

		if (child) {
			$$renderer.push('<!--[0-->');
			child($$renderer, { props: mergedProps(), ...calendarState.snippetProps });
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push(`<!--[-1--><div${$.attributes({ ...mergedProps() })}>`);
			children?.($$renderer, calendarState.snippetProps);
			$$renderer.push(`<!----></div>`);
		}

		$$renderer.push(`<!--]-->`);
		$.bind_props($$props, { ref });
	});
}