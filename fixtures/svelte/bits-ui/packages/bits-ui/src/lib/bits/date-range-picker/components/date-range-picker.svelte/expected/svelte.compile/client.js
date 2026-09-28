import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { watch } from "runed";
import { boxWith, mergeProps } from "svelte-toolbelt";
import { DateRangePickerRootState } from "../date-range-picker.svelte.js";
import { noop } from "$lib/internal/noop.js";
import { PopoverRootState } from "$lib/bits/popover/popover.svelte.js";
import { DateRangeFieldRootState } from "$lib/bits/date-range-field/date-range-field.svelte.js";
import FloatingLayer from "$lib/bits/utilities/floating-layer/components/floating-layer.svelte";
import { useId } from "$lib/internal/use-id.js";
import { getDefaultDate } from "$lib/internal/date-time/utils.js";
import { resolveLocaleProp } from "$lib/bits/utilities/config/prop-resolvers.js";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'open',
	'onOpenChange',
	'onOpenChangeComplete',
	'value',
	'id',
	'ref',
	'onValueChange',
	'placeholder',
	'onPlaceholderChange',
	'isDateUnavailable',
	'onInvalid',
	'minValue',
	'maxValue',
	'disabled',
	'readonly',
	'granularity',
	'readonlySegments',
	'hourCycle',
	'locale',
	'hideTimeZone',
	'required',
	'calendarLabel',
	'disableDaysOutsideMonth',
	'preventDeselect',
	'pagedNavigation',
	'weekStartsOn',
	'weekdayFormat',
	'isDateDisabled',
	'fixedWeeks',
	'numberOfMonths',
	'closeOnRangeSelect',
	'onStartValueChange',
	'onEndValueChange',
	'validate',
	'errorMessageId',
	'minDays',
	'maxDays',
	'excludeDisabled',
	'child',
	'children',
	'monthFormat',
	'yearFormat'
]);

var root = $.from_html(`<div><!></div>`);

export default function Date_range_picker($$anchor, $$props) {
	$.push($$props, true);

	let open = $.prop($$props, 'open', 15, false),
		onOpenChange = $.prop($$props, 'onOpenChange', 3, noop),
		onOpenChangeComplete = $.prop($$props, 'onOpenChangeComplete', 3, noop),
		value = $.prop($$props, 'value', 15),
		id = $.prop($$props, 'id', 19, useId),
		ref = $.prop($$props, 'ref', 15, null),
		onValueChange = $.prop($$props, 'onValueChange', 3, noop),
		placeholder = $.prop($$props, 'placeholder', 15),
		onPlaceholderChange = $.prop($$props, 'onPlaceholderChange', 3, noop),
		isDateUnavailable = $.prop($$props, 'isDateUnavailable', 3, () => false),
		onInvalid = $.prop($$props, 'onInvalid', 3, noop),
		disabled = $.prop($$props, 'disabled', 3, false),
		readonly = $.prop($$props, 'readonly', 3, false),
		readonlySegments = $.prop($$props, 'readonlySegments', 19, () => []),
		hideTimeZone = $.prop($$props, 'hideTimeZone', 3, false),
		required = $.prop($$props, 'required', 3, false),
		calendarLabel = $.prop($$props, 'calendarLabel', 3, "Event"),
		disableDaysOutsideMonth = $.prop($$props, 'disableDaysOutsideMonth', 3, true),
		preventDeselect = $.prop($$props, 'preventDeselect', 3, false),
		pagedNavigation = $.prop($$props, 'pagedNavigation', 3, false),
		weekdayFormat = $.prop($$props, 'weekdayFormat', 3, "narrow"),
		isDateDisabled = $.prop($$props, 'isDateDisabled', 3, () => false),
		fixedWeeks = $.prop($$props, 'fixedWeeks', 3, false),
		numberOfMonths = $.prop($$props, 'numberOfMonths', 3, 1),
		closeOnRangeSelect = $.prop($$props, 'closeOnRangeSelect', 3, true),
		onStartValueChange = $.prop($$props, 'onStartValueChange', 3, noop),
		onEndValueChange = $.prop($$props, 'onEndValueChange', 3, noop),
		validate = $.prop($$props, 'validate', 3, noop),
		excludeDisabled = $.prop($$props, 'excludeDisabled', 3, false),
		monthFormat = $.prop($$props, 'monthFormat', 3, "long"),
		yearFormat = $.prop($$props, 'yearFormat', 3, "numeric"),
		restProps = $.rest_props($$props, rest_excludes);

	let startValue = $.state($.proxy(value()?.start));
	let endValue = $.state($.proxy(value()?.end));

	function handleDefaultValue() {
		if (value() !== undefined) return;

		value({ start: undefined, end: undefined });
	}

	// SSR
	handleDefaultValue();

	/**
	 * Covers an edge case where when a spread props object is reassigned,
	 * the props are reset to their default values, which would make value
	 * undefined which causes errors to be thrown.
	 */
	watch.pre(() => value(), () => {
		handleDefaultValue();
	});

	const defaultPlaceholder = getDefaultDate({
		granularity: $$props.granularity,
		defaultValue: value()?.start,
		minValue: $$props.minValue,
		maxValue: $$props.maxValue
	});

	function handleDefaultPlaceholder() {
		if (placeholder() !== undefined) return;

		placeholder(defaultPlaceholder);
	}

	// SSR
	handleDefaultPlaceholder();

	/**
	 * Covers an edge case where when a spread props object is reassigned,
	 * the props are reset to their default values, which would make placeholder
	 * undefined which causes errors to be thrown.
	 */
	watch.pre(() => placeholder(), () => {
		handleDefaultPlaceholder();
	});

	function onRangeSelect() {
		if (closeOnRangeSelect()) {
			open(false);
		}
	}

	const pickerRootState = DateRangePickerRootState.create({
		open: boxWith(() => open(), (v) => {
			open(v);
			onOpenChange()(v);
		}),

		value: boxWith(() => value(), (v) => {
			value(v);
			onValueChange()(v);
		}),

		placeholder: boxWith(() => placeholder(), (v) => {
			placeholder(v);
			onPlaceholderChange()(v);
		}),
		isDateUnavailable: boxWith(() => isDateUnavailable()),
		minValue: boxWith(() => $$props.minValue),
		maxValue: boxWith(() => $$props.maxValue),
		minDays: boxWith(() => $$props.minDays),
		maxDays: boxWith(() => $$props.maxDays),
		disabled: boxWith(() => disabled()),
		readonly: boxWith(() => readonly()),
		granularity: boxWith(() => $$props.granularity),
		readonlySegments: boxWith(() => readonlySegments()),
		hourCycle: boxWith(() => $$props.hourCycle),
		locale: resolveLocaleProp(() => $$props.locale),
		hideTimeZone: boxWith(() => hideTimeZone()),
		required: boxWith(() => required()),
		calendarLabel: boxWith(() => calendarLabel()),
		disableDaysOutsideMonth: boxWith(() => disableDaysOutsideMonth()),
		preventDeselect: boxWith(() => preventDeselect()),
		pagedNavigation: boxWith(() => pagedNavigation()),
		weekStartsOn: boxWith(() => $$props.weekStartsOn),
		weekdayFormat: boxWith(() => weekdayFormat()),
		isDateDisabled: boxWith(() => isDateDisabled()),
		fixedWeeks: boxWith(() => fixedWeeks()),
		numberOfMonths: boxWith(() => numberOfMonths()),
		excludeDisabled: boxWith(() => excludeDisabled()),
		onRangeSelect: boxWith(() => onRangeSelect),
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

	PopoverRootState.create({
		open: pickerRootState.opts.open,
		onOpenChangeComplete: boxWith(() => onOpenChangeComplete())
	});

	const fieldRootState = DateRangeFieldRootState.create({
		value: pickerRootState.opts.value,
		disabled: pickerRootState.opts.disabled,
		readonly: pickerRootState.opts.readonly,
		readonlySegments: pickerRootState.opts.readonlySegments,
		validate: boxWith(() => validate()),
		minValue: pickerRootState.opts.minValue,
		maxValue: pickerRootState.opts.maxValue,
		granularity: pickerRootState.opts.granularity,
		hideTimeZone: pickerRootState.opts.hideTimeZone,
		hourCycle: pickerRootState.opts.hourCycle,
		locale: pickerRootState.opts.locale,
		required: pickerRootState.opts.required,
		placeholder: pickerRootState.opts.placeholder,
		id: boxWith(() => id()),
		ref: boxWith(() => ref(), (v) => ref(v)),
		startValue: pickerRootState.opts.startValue,
		endValue: pickerRootState.opts.endValue,
		onInvalid: boxWith(() => onInvalid()),
		errorMessageId: boxWith(() => $$props.errorMessageId)
	});

	const mergedProps = $.derived(() => mergeProps(restProps, fieldRootState.props));

	FloatingLayer($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			{
				var consequent = ($$anchor) => {
					var fragment_2 = $.comment();
					var node_1 = $.first_child(fragment_2);

					$.snippet(node_1, () => $$props.child, () => ({ props: $.get(mergedProps) }));
					$.append($$anchor, fragment_2);
				};

				var alternate = ($$anchor) => {
					var div = root();

					$.attribute_effect(div, () => ({ ...$.get(mergedProps) }));

					var node_2 = $.child(div);

					$.snippet(node_2, () => $$props.children ?? $.noop);
					$.reset(div);
					$.append($$anchor, div);
				};

				$.if(node, ($$render) => {
					if ($$props.child) $$render(consequent); else $$render(alternate, -1);
				});
			}

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.pop();
}