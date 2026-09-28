import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { watch } from "runed";
import { boxWith, mergeProps } from "svelte-toolbelt";
import { DateRangeFieldRootState } from "../date-range-field.svelte.js";
import { createId } from "$lib/internal/create-id.js";
import { noop } from "$lib/internal/noop.js";
import { getDefaultDate } from "$lib/internal/date-time/utils.js";
import { resolveLocaleProp } from "$lib/bits/utilities/config/prop-resolvers.js";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'id',
	'ref',
	'value',
	'onValueChange',
	'placeholder',
	'onPlaceholderChange',
	'disabled',
	'readonly',
	'required',
	'hourCycle',
	'granularity',
	'locale',
	'hideTimeZone',
	'validate',
	'onInvalid',
	'maxValue',
	'minValue',
	'readonlySegments',
	'children',
	'child',
	'onStartValueChange',
	'onEndValueChange',
	'errorMessageId'
]);

var root = $.from_html(`<div><!></div>`);

export default function Date_range_field($$anchor, $$props) {
	const uid = $.props_id();

	$.push($$props, true);

	let id = $.prop($$props, 'id', 19, () => createId(uid)),
		ref = $.prop($$props, 'ref', 15, null),
		value = $.prop($$props, 'value', 15),
		onValueChange = $.prop($$props, 'onValueChange', 3, noop),
		placeholder = $.prop($$props, 'placeholder', 15),
		onPlaceholderChange = $.prop($$props, 'onPlaceholderChange', 3, noop),
		disabled = $.prop($$props, 'disabled', 3, false),
		readonly = $.prop($$props, 'readonly', 3, false),
		required = $.prop($$props, 'required', 3, false),
		hideTimeZone = $.prop($$props, 'hideTimeZone', 3, false),
		validate = $.prop($$props, 'validate', 3, noop),
		onInvalid = $.prop($$props, 'onInvalid', 3, noop),
		readonlySegments = $.prop($$props, 'readonlySegments', 19, () => []),
		onStartValueChange = $.prop($$props, 'onStartValueChange', 3, noop),
		onEndValueChange = $.prop($$props, 'onEndValueChange', 3, noop),
		restProps = $.rest_props($$props, rest_excludes);

	let startValue = $.state($.proxy(value()?.start));
	let endValue = $.state($.proxy(value()?.end));

	function handleDefaultPlaceholder() {
		if (placeholder() !== undefined) return;

		const defaultPlaceholder = getDefaultDate({
			granularity: $$props.granularity,
			defaultValue: value()?.start,
			minValue: $$props.minValue,
			maxValue: $$props.maxValue
		});

		placeholder(defaultPlaceholder);
	}

	// SSR
	handleDefaultPlaceholder();

	watch.pre(() => placeholder(), () => {
		handleDefaultPlaceholder();
	});

	function handleDefaultValue() {
		if (value() !== undefined) return;

		const defaultValue = { start: undefined, end: undefined };

		value(defaultValue);
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

	const rootState = DateRangeFieldRootState.create({
		id: boxWith(() => id()),
		ref: boxWith(() => ref(), (v) => ref(v)),
		disabled: boxWith(() => disabled()),
		readonly: boxWith(() => readonly()),
		required: boxWith(() => required()),
		hourCycle: boxWith(() => $$props.hourCycle),
		granularity: boxWith(() => $$props.granularity),
		locale: resolveLocaleProp(() => $$props.locale),
		hideTimeZone: boxWith(() => hideTimeZone()),
		validate: boxWith(() => validate()),
		maxValue: boxWith(() => $$props.maxValue),
		minValue: boxWith(() => $$props.minValue),
		placeholder: boxWith(() => placeholder(), (v) => {
			placeholder(v);
			onPlaceholderChange()(v);
		}),
		readonlySegments: boxWith(() => readonlySegments()),
		value: boxWith(() => value(), (v) => {
			value(v);
			onValueChange()(v);
		}),

		startValue: boxWith(() => $.get(startValue), (v) => {
			$.set(startValue, v, true);
			onStartValueChange()(v);
		}),

		endValue: boxWith(() => $.get(endValue), (v) => {
			$.set(endValue, v, true);
			onEndValueChange()(v);
		}),
		onInvalid: boxWith(() => onInvalid()),
		errorMessageId: boxWith(() => $$props.errorMessageId)
	});

	const mergedProps = $.derived(() => mergeProps(restProps, rootState.props));
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			$.snippet(node_1, () => $$props.child, () => ({ props: $.get(mergedProps) }));
			$.append($$anchor, fragment_1);
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

	$.append($$anchor, fragment);
	$.pop();
}