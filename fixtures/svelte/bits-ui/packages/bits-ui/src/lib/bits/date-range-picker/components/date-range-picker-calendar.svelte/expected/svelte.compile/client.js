import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { boxWith, mergeProps } from "svelte-toolbelt";
import { DateRangePickerRootContext } from "../date-range-picker.svelte.js";
import { createId } from "$lib/internal/create-id.js";
import { RangeCalendarRootState } from "$lib/bits/range-calendar/range-calendar.svelte.js";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'children',
	'child',
	'id',
	'ref'
]);

var root = $.from_html(`<div><!></div>`);

export default function Date_range_picker_calendar($$anchor, $$props) {
	const uid = $.props_id();

	$.push($$props, true);

	let id = $.prop($$props, 'id', 19, () => createId(uid)),
		ref = $.prop($$props, 'ref', 15, null),
		restProps = $.rest_props($$props, rest_excludes);

	const dateRangePickerRootState = DateRangePickerRootContext.get();

	const rangeCalendarState = RangeCalendarRootState.create({
		id: boxWith(() => id()),
		ref: boxWith(() => ref(), (v) => ref(v)),
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
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			{
				let $0 = $.derived(() => ({
					props: $.get(mergedProps),
					...rangeCalendarState.snippetProps
				}));

				$.snippet(node_1, () => $$props.child, () => $.get($0));
			}

			$.append($$anchor, fragment_1);
		};

		var alternate = ($$anchor) => {
			var div = root();

			$.attribute_effect(div, () => ({ ...$.get(mergedProps) }));

			var node_2 = $.child(div);

			$.snippet(node_2, () => $$props.children ?? $.noop, () => rangeCalendarState.snippetProps);
			$.reset(div);
			$.append($$anchor, div);
		};

		$.if(node, ($$render) => {
			if ($$props.child) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}