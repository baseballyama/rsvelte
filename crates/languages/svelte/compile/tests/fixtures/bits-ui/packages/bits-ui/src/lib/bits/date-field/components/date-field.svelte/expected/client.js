import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { watch } from "runed";
import { boxWith } from "svelte-toolbelt";
import { DateFieldRootState } from "../date-field.svelte.js";
import { noop } from "$lib/internal/noop.js";
import { getDefaultDate } from "$lib/internal/date-time/utils.js";
import { resolveLocaleProp } from "$lib/bits/utilities/config/prop-resolvers.js";

export default function Date_field($$anchor, $$props) {
	$.push($$props, true);

	let disabled = $.prop($$props, 'disabled', 3, false),
		hideTimeZone = $.prop($$props, 'hideTimeZone', 3, false),
		onPlaceholderChange = $.prop($$props, 'onPlaceholderChange', 3, noop),
		onValueChange = $.prop($$props, 'onValueChange', 3, noop),
		validate = $.prop($$props, 'validate', 3, noop),
		onInvalid = $.prop($$props, 'onInvalid', 3, noop),
		placeholder = $.prop($$props, 'placeholder', 15),
		value = $.prop($$props, 'value', 15),
		readonly = $.prop($$props, 'readonly', 3, false),
		readonlySegments = $.prop($$props, 'readonlySegments', 19, () => []),
		required = $.prop($$props, 'required', 3, false);

	function handleDefaultPlaceholder(setPlaceholder = true) {
		if (placeholder() !== undefined) return placeholder();

		const defaultPlaceholder = getDefaultDate({
			granularity: $$props.granularity,
			defaultValue: value(),
			minValue: $$props.minValue,
			maxValue: $$props.maxValue
		});

		if (setPlaceholder) {
			placeholder(defaultPlaceholder);
		}

		return defaultPlaceholder;
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

	DateFieldRootState.create({
		value: boxWith(() => value(), (v) => {
			value(v);
			onValueChange()(v);
		}),

		placeholder: boxWith(
			() => {
				if (placeholder() === undefined) return handleDefaultPlaceholder(false);

				return placeholder();
			},
			(v) => {
				if (v === undefined) return;

				placeholder(v);
				onPlaceholderChange()(v);
			}
		),
		disabled: boxWith(() => disabled()),
		granularity: boxWith(() => $$props.granularity),
		hideTimeZone: boxWith(() => hideTimeZone()),
		hourCycle: boxWith(() => $$props.hourCycle),
		locale: resolveLocaleProp(() => $$props.locale),
		maxValue: boxWith(() => $$props.maxValue),
		minValue: boxWith(() => $$props.minValue),
		validate: boxWith(() => validate()),
		readonly: boxWith(() => readonly()),
		readonlySegments: boxWith(() => readonlySegments()),
		required: boxWith(() => required()),
		onInvalid: boxWith(() => onInvalid()),
		errorMessageId: boxWith(() => $$props.errorMessageId),
		isInvalidProp: boxWith(() => undefined)
	});

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.append($$anchor, fragment);
	$.pop();
}