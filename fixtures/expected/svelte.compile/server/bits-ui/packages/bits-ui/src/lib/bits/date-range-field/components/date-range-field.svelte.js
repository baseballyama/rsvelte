import * as $ from 'svelte/internal/server';
import { watch } from "runed";
import { boxWith, mergeProps } from "svelte-toolbelt";
import { DateRangeFieldRootState } from "../date-range-field.svelte.js";
import { createId } from "$lib/internal/create-id.js";
import { noop } from "$lib/internal/noop.js";
import { getDefaultDate } from "$lib/internal/date-time/utils.js";
import { resolveLocaleProp } from "$lib/bits/utilities/config/prop-resolvers.js";

export default function Date_range_field($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const uid = $.props_id($$renderer);

		let {
			id = createId(uid),
			ref = null,
			value = void 0,
			onValueChange = noop,
			placeholder = void 0,
			onPlaceholderChange = noop,
			disabled = false,
			readonly = false,
			required = false,
			hourCycle,
			granularity,
			locale,
			hideTimeZone = false,
			validate = noop,
			onInvalid = noop,
			maxValue,
			minValue,
			readonlySegments = [],
			children,
			child,
			onStartValueChange = noop,
			onEndValueChange = noop,
			errorMessageId,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		let startValue = value?.start;
		let endValue = value?.end;

		function handleDefaultPlaceholder() {
			if (placeholder !== undefined) return;

			const defaultPlaceholder = getDefaultDate({ granularity, defaultValue: value?.start, minValue, maxValue });

			placeholder = defaultPlaceholder;
		}

		// SSR
		handleDefaultPlaceholder();

		watch.pre(() => placeholder, () => {
			handleDefaultPlaceholder();
		});

		function handleDefaultValue() {
			if (value !== undefined) return;

			const defaultValue = { start: undefined, end: undefined };

			value = defaultValue;
		}

		// SSR
		handleDefaultValue();

		/**
		 * Covers an edge case where when a spread props object is reassigned,
		 * the props are reset to their default values, which would make value
		 * undefined which causes errors to be thrown.
		 */
		watch.pre(() => value, () => {
			handleDefaultValue();
		});

		const rootState = DateRangeFieldRootState.create({
			id: boxWith(() => id),
			ref: boxWith(() => ref, (v) => ref = v),
			disabled: boxWith(() => disabled),
			readonly: boxWith(() => readonly),
			required: boxWith(() => required),
			hourCycle: boxWith(() => hourCycle),
			granularity: boxWith(() => granularity),
			locale: resolveLocaleProp(() => locale),
			hideTimeZone: boxWith(() => hideTimeZone),
			validate: boxWith(() => validate),
			maxValue: boxWith(() => maxValue),
			minValue: boxWith(() => minValue),
			placeholder: boxWith(() => placeholder, (v) => {
				placeholder = v;
				onPlaceholderChange(v);
			}),
			readonlySegments: boxWith(() => readonlySegments),
			value: boxWith(() => value, (v) => {
				value = v;
				onValueChange(v);
			}),

			startValue: boxWith(() => startValue, (v) => {
				startValue = v;
				onStartValueChange(v);
			}),

			endValue: boxWith(() => endValue, (v) => {
				endValue = v;
				onEndValueChange(v);
			}),
			onInvalid: boxWith(() => onInvalid),
			errorMessageId: boxWith(() => errorMessageId)
		});

		const mergedProps = $.derived(() => mergeProps(restProps, rootState.props));

		if (child) {
			$$renderer.push('<!--[0-->');
			child($$renderer, { props: mergedProps() });
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push(`<!--[-1--><div${$.attributes({ ...mergedProps() })}>`);
			children?.($$renderer);
			$$renderer.push(`<!----></div>`);
		}

		$$renderer.push(`<!--]-->`);
		$.bind_props($$props, { ref, value, placeholder });
	});
}