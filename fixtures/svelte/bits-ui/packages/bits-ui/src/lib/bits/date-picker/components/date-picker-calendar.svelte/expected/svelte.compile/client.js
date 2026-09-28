import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { boxWith, mergeProps } from "svelte-toolbelt";
import { DatePickerRootContext } from "../date-picker.svelte.js";
import { CalendarRootState } from "$lib/bits/calendar/calendar.svelte.js";
import { createId } from "$lib/internal/create-id.js";

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

export default function Date_picker_calendar($$anchor, $$props) {
	const uid = $.props_id();

	$.push($$props, true);

	let id = $.prop($$props, 'id', 19, () => createId(uid)),
		ref = $.prop($$props, 'ref', 15, null),
		restProps = $.rest_props($$props, rest_excludes);

	const datePickerRootState = DatePickerRootContext.get();

	const calendarState = CalendarRootState.create({
		id: boxWith(() => id()),
		ref: boxWith(() => ref(), (v) => ref(v)),
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
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			{
				let $0 = $.derived(() => ({ props: $.get(mergedProps), ...calendarState.snippetProps }));

				$.snippet(node_1, () => $$props.child, () => $.get($0));
			}

			$.append($$anchor, fragment_1);
		};

		var alternate = ($$anchor) => {
			var div = root();

			$.attribute_effect(div, () => ({ ...$.get(mergedProps) }));

			var node_2 = $.child(div);

			$.snippet(node_2, () => $$props.children ?? $.noop, () => calendarState.snippetProps);
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