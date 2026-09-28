import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { watch } from "runed";
import { boxWith, mergeProps } from "svelte-toolbelt";
import { RangeCalendarRootState } from "../range-calendar.svelte.js";
import { noop } from "$lib/internal/noop.js";
import { createId } from "$lib/internal/create-id.js";
import { getDefaultDate } from "$lib/internal/date-time/utils.js";
import { resolveLocaleProp } from "$lib/bits/utilities/config/prop-resolvers.js";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'children',
	'child',
	'id',
	'ref',
	'value',
	'onValueChange',
	'placeholder',
	'onPlaceholderChange',
	'weekdayFormat',
	'weekStartsOn',
	'pagedNavigation',
	'isDateDisabled',
	'isDateUnavailable',
	'fixedWeeks',
	'numberOfMonths',
	'locale',
	'calendarLabel',
	'disabled',
	'readonly',
	'minValue',
	'maxValue',
	'preventDeselect',
	'disableDaysOutsideMonth',
	'minDays',
	'maxDays',
	'onStartValueChange',
	'onEndValueChange',
	'excludeDisabled',
	'monthFormat',
	'yearFormat'
]);

var root = $.from_html(`<div><!></div>`);

export default function Range_calendar($$anchor, $$props) {
	const uid = $.props_id();

	$.push($$props, true);

	let id = $.prop($$props, 'id', 19, () => createId(uid)),
		ref = $.prop($$props, 'ref', 15, null),
		value = $.prop($$props, 'value', 15),
		onValueChange = $.prop($$props, 'onValueChange', 3, noop),
		placeholder = $.prop($$props, 'placeholder', 15),
		onPlaceholderChange = $.prop($$props, 'onPlaceholderChange', 3, noop),
		weekdayFormat = $.prop($$props, 'weekdayFormat', 3, "narrow"),
		pagedNavigation = $.prop($$props, 'pagedNavigation', 3, false),
		isDateDisabled = $.prop($$props, 'isDateDisabled', 3, () => false),
		isDateUnavailable = $.prop($$props, 'isDateUnavailable', 3, () => false),
		fixedWeeks = $.prop($$props, 'fixedWeeks', 3, false),
		numberOfMonths = $.prop($$props, 'numberOfMonths', 3, 1),
		calendarLabel = $.prop($$props, 'calendarLabel', 3, "Event"),
		disabled = $.prop($$props, 'disabled', 3, false),
		readonly = $.prop($$props, 'readonly', 3, false),
		minValue = $.prop($$props, 'minValue', 3, undefined),
		maxValue = $.prop($$props, 'maxValue', 3, undefined),
		preventDeselect = $.prop($$props, 'preventDeselect', 3, false),
		disableDaysOutsideMonth = $.prop($$props, 'disableDaysOutsideMonth', 3, true),
		onStartValueChange = $.prop($$props, 'onStartValueChange', 3, noop),
		onEndValueChange = $.prop($$props, 'onEndValueChange', 3, noop),
		excludeDisabled = $.prop($$props, 'excludeDisabled', 3, false),
		monthFormat = $.prop($$props, 'monthFormat', 3, "long"),
		yearFormat = $.prop($$props, 'yearFormat', 3, "numeric"),
		restProps = $.rest_props($$props, rest_excludes);

	let startValue = $.state($.proxy(value()?.start));
	let endValue = $.state($.proxy(value()?.end));

	const defaultPlaceholder = getDefaultDate({
		defaultValue: value()?.start,
		minValue: minValue(),
		maxValue: maxValue()
	});

	function handleDefaultPlaceholder() {
		if (placeholder() !== undefined) return;

		placeholder(defaultPlaceholder);
	}

	// SSR
	handleDefaultPlaceholder();

	watch.pre(() => placeholder(), () => {
		handleDefaultPlaceholder();
	});

	function handleDefaultValue() {
		if (value() !== undefined) return;

		value({ start: undefined, end: undefined });
	}

	// SSR
	handleDefaultValue();

	watch.pre(() => value(), () => {
		handleDefaultValue();
	});

	const rootState = RangeCalendarRootState.create({
		id: boxWith(() => id()),
		ref: boxWith(() => ref(), (v) => ref(v)),
		value: boxWith(() => value(), (v) => {
			value(v);
			onValueChange()(v);
		}),

		placeholder: boxWith(() => placeholder(), (v) => {
			placeholder(v);
			onPlaceholderChange()(v);
		}),
		disabled: boxWith(() => disabled()),
		readonly: boxWith(() => readonly()),
		preventDeselect: boxWith(() => preventDeselect()),
		minValue: boxWith(() => minValue()),
		maxValue: boxWith(() => maxValue()),
		isDateUnavailable: boxWith(() => isDateUnavailable()),
		isDateDisabled: boxWith(() => isDateDisabled()),
		pagedNavigation: boxWith(() => pagedNavigation()),
		weekStartsOn: boxWith(() => $$props.weekStartsOn),
		weekdayFormat: boxWith(() => weekdayFormat()),
		numberOfMonths: boxWith(() => numberOfMonths()),
		locale: resolveLocaleProp(() => $$props.locale),
		calendarLabel: boxWith(() => calendarLabel()),
		fixedWeeks: boxWith(() => fixedWeeks()),
		disableDaysOutsideMonth: boxWith(() => disableDaysOutsideMonth()),
		minDays: boxWith(() => $$props.minDays),
		maxDays: boxWith(() => $$props.maxDays),
		excludeDisabled: boxWith(() => excludeDisabled()),
		startValue: boxWith(() => $.get(startValue), (v) => {
			$.set(startValue, v, true);
			onStartValueChange()(v);
		}),

		endValue: boxWith(() => $.get(endValue), (v) => {
			$.set(endValue, v, true);
			onEndValueChange()(v);
		}),
		monthFormat: boxWith(() => monthFormat()),
		yearFormat: boxWith(() => yearFormat()),
		defaultPlaceholder
	});

	const mergedProps = $.derived(() => mergeProps(restProps, rootState.props));
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			{
				let $0 = $.derived(() => ({ props: $.get(mergedProps), ...rootState.snippetProps }));

				$.snippet(node_1, () => $$props.child, () => $.get($0));
			}

			$.append($$anchor, fragment_1);
		};

		var alternate = ($$anchor) => {
			var div = root();

			$.attribute_effect(div, () => ({ ...$.get(mergedProps) }));

			var node_2 = $.child(div);

			$.snippet(node_2, () => $$props.children ?? $.noop, () => rootState.snippetProps);
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