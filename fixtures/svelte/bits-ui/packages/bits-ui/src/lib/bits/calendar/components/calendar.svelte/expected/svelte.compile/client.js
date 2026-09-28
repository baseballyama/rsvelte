import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { watch } from "runed";
import { boxWith, mergeProps } from "svelte-toolbelt";
import { CalendarRootState } from "../calendar.svelte.js";
import { useId } from "$lib/internal/use-id.js";
import { noop } from "$lib/internal/noop.js";
import { getDefaultDate } from "$lib/internal/date-time/utils.js";
import { resolveLocaleProp } from "$lib/bits/utilities/config/prop-resolvers.js";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'child',
	'children',
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
	'type',
	'disableDaysOutsideMonth',
	'initialFocus',
	'maxDays',
	'monthFormat',
	'yearFormat'
]);

var root = $.from_html(`<div><!></div>`);

export default function Calendar($$anchor, $$props) {
	$.push($$props, true);

	let id = $.prop($$props, 'id', 19, useId),
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
		initialFocus = $.prop($$props, 'initialFocus', 3, false),
		monthFormat = $.prop($$props, 'monthFormat', 3, "long"),
		yearFormat = $.prop($$props, 'yearFormat', 3, "numeric"),
		restProps = $.rest_props($$props, rest_excludes);

	const defaultPlaceholder = getDefaultDate({
		defaultValue: value(),
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

		value($$props.type === "single" ? undefined : []);
	}

	// SSR
	handleDefaultValue();

	watch.pre(() => value(), () => {
		handleDefaultValue();
	});

	const rootState = CalendarRootState.create({
		id: boxWith(() => id()),
		ref: boxWith(() => ref(), (v) => ref(v)),
		weekdayFormat: boxWith(() => weekdayFormat()),
		weekStartsOn: boxWith(() => $$props.weekStartsOn),
		pagedNavigation: boxWith(() => pagedNavigation()),
		isDateDisabled: boxWith(() => isDateDisabled()),
		isDateUnavailable: boxWith(() => isDateUnavailable()),
		fixedWeeks: boxWith(() => fixedWeeks()),
		numberOfMonths: boxWith(() => numberOfMonths()),
		locale: resolveLocaleProp(() => $$props.locale),
		calendarLabel: boxWith(() => calendarLabel()),
		readonly: boxWith(() => readonly()),
		disabled: boxWith(() => disabled()),
		minValue: boxWith(() => minValue()),
		maxValue: boxWith(() => maxValue()),
		disableDaysOutsideMonth: boxWith(() => disableDaysOutsideMonth()),
		initialFocus: boxWith(() => initialFocus()),
		maxDays: boxWith(() => $$props.maxDays),
		placeholder: boxWith(() => placeholder(), (v) => {
			placeholder(v);
			onPlaceholderChange()(v);
		}),
		preventDeselect: boxWith(() => preventDeselect()),
		value: boxWith(() => value(), (v) => {
			value(v);

			// oxlint-disable-next-line no-explicit-any
			onValueChange()(v);
		}),
		type: boxWith(() => $$props.type),
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