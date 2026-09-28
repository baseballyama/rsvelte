import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { watch } from "runed";
import { boxWith } from "svelte-toolbelt";
import { DatePickerRootState } from "../date-picker.svelte.js";
import { noop } from "$lib/internal/noop.js";
import { PopoverRootState } from "$lib/bits/popover/popover.svelte.js";
import { DateFieldRootState } from "$lib/bits/date-field/date-field.svelte.js";
import { FloatingLayer } from "$lib/bits/utilities/floating-layer/index.js";
import { getDefaultDate } from "$lib/internal/date-time/utils.js";
import { resolveLocaleProp } from "$lib/bits/utilities/config/prop-resolvers.js";

export default function Date_picker($$anchor, $$props) {
	$.push($$props, true);

	// Date Picker composes the DateField, Popover, and Calendar components
	let open = $.prop($$props, 'open', 15, false),
		onOpenChange = $.prop($$props, 'onOpenChange', 3, noop),
		onOpenChangeComplete = $.prop($$props, 'onOpenChangeComplete', 3, noop),
		value = $.prop($$props, 'value', 15),
		onValueChange = $.prop($$props, 'onValueChange', 3, noop),
		placeholder = $.prop($$props, 'placeholder', 15),
		onPlaceholderChange = $.prop($$props, 'onPlaceholderChange', 3, noop),
		isDateUnavailable = $.prop($$props, 'isDateUnavailable', 3, () => false),
		validate = $.prop($$props, 'validate', 3, noop),
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
		closeOnDateSelect = $.prop($$props, 'closeOnDateSelect', 3, true),
		initialFocus = $.prop($$props, 'initialFocus', 3, false),
		monthFormat = $.prop($$props, 'monthFormat', 3, "long"),
		yearFormat = $.prop($$props, 'yearFormat', 3, "numeric");

	const defaultPlaceholder = getDefaultDate({
		granularity: $$props.granularity,
		defaultValue: value(),
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

	function onDateSelect() {
		if (closeOnDateSelect()) {
			open(false);
		}
	}

	const pickerRootState = DatePickerRootState.create({
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
		initialFocus: boxWith(() => initialFocus()),
		onDateSelect: boxWith(() => onDateSelect),
		defaultPlaceholder,
		monthFormat: boxWith(() => monthFormat()),
		yearFormat: boxWith(() => yearFormat())
	});

	PopoverRootState.create({
		open: pickerRootState.opts.open,
		onOpenChangeComplete: boxWith(() => onOpenChangeComplete())
	});

	DateFieldRootState.create({
		value: pickerRootState.opts.value,
		disabled: pickerRootState.opts.disabled,
		readonly: pickerRootState.opts.readonly,
		readonlySegments: pickerRootState.opts.readonlySegments,
		validate: boxWith(() => validate()),
		onInvalid: boxWith(() => onInvalid()),
		minValue: pickerRootState.opts.minValue,
		maxValue: pickerRootState.opts.maxValue,
		granularity: pickerRootState.opts.granularity,
		hideTimeZone: pickerRootState.opts.hideTimeZone,
		hourCycle: pickerRootState.opts.hourCycle,
		locale: pickerRootState.opts.locale,
		required: pickerRootState.opts.required,
		placeholder: pickerRootState.opts.placeholder,
		errorMessageId: boxWith(() => $$props.errorMessageId),
		isInvalidProp: boxWith(() => undefined)
	});

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => FloatingLayer.Root, ($$anchor, FloatingLayer_Root) => {
		FloatingLayer_Root($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = $.comment();
				var node_1 = $.first_child(fragment_1);

				$.snippet(node_1, () => $$props.children ?? $.noop);
				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
	$.pop();
}