import * as $ from 'svelte/internal/server';
import { watch } from "runed";
import { boxWith, mergeProps } from "svelte-toolbelt";
import { CalendarRootState } from "../calendar.svelte.js";
import { useId } from "$lib/internal/use-id.js";
import { noop } from "$lib/internal/noop.js";
import { getDefaultDate } from "$lib/internal/date-time/utils.js";
import { resolveLocaleProp } from "$lib/bits/utilities/config/prop-resolvers.js";

export default function Calendar($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			child,
			children,
			id = useId(),
			ref = null,
			value = void 0,
			onValueChange = noop,
			placeholder = void 0,
			onPlaceholderChange = noop,
			weekdayFormat = "narrow",
			weekStartsOn,
			pagedNavigation = false,
			isDateDisabled = () => false,
			isDateUnavailable = () => false,
			fixedWeeks = false,
			numberOfMonths = 1,
			locale,
			calendarLabel = "Event",
			disabled = false,
			readonly = false,
			minValue = undefined,
			maxValue = undefined,
			preventDeselect = false,
			type,
			disableDaysOutsideMonth = true,
			initialFocus = false,
			maxDays,
			monthFormat = "long",
			yearFormat = "numeric",
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const defaultPlaceholder = getDefaultDate({ defaultValue: value, minValue, maxValue });

		function handleDefaultPlaceholder() {
			if (placeholder !== undefined) return;

			placeholder = defaultPlaceholder;
		}

		// SSR
		handleDefaultPlaceholder();

		watch.pre(() => placeholder, () => {
			handleDefaultPlaceholder();
		});

		function handleDefaultValue() {
			if (value !== undefined) return;

			value = type === "single" ? undefined : [];
		}

		// SSR
		handleDefaultValue();

		watch.pre(() => value, () => {
			handleDefaultValue();
		});

		const rootState = CalendarRootState.create({
			id: boxWith(() => id),
			ref: boxWith(() => ref, (v) => ref = v),
			weekdayFormat: boxWith(() => weekdayFormat),
			weekStartsOn: boxWith(() => weekStartsOn),
			pagedNavigation: boxWith(() => pagedNavigation),
			isDateDisabled: boxWith(() => isDateDisabled),
			isDateUnavailable: boxWith(() => isDateUnavailable),
			fixedWeeks: boxWith(() => fixedWeeks),
			numberOfMonths: boxWith(() => numberOfMonths),
			locale: resolveLocaleProp(() => locale),
			calendarLabel: boxWith(() => calendarLabel),
			readonly: boxWith(() => readonly),
			disabled: boxWith(() => disabled),
			minValue: boxWith(() => minValue),
			maxValue: boxWith(() => maxValue),
			disableDaysOutsideMonth: boxWith(() => disableDaysOutsideMonth),
			initialFocus: boxWith(() => initialFocus),
			maxDays: boxWith(() => maxDays),
			placeholder: boxWith(() => placeholder, (v) => {
				placeholder = v;
				onPlaceholderChange(v);
			}),
			preventDeselect: boxWith(() => preventDeselect),
			value: boxWith(() => value, (v) => {
				value = v;

				// oxlint-disable-next-line no-explicit-any
				onValueChange(v);
			}),
			type: boxWith(() => type),
			monthFormat: boxWith(() => monthFormat),
			yearFormat: boxWith(() => yearFormat),
			defaultPlaceholder
		});

		const mergedProps = $.derived(() => mergeProps(restProps, rootState.props));

		if (child) {
			$$renderer.push('<!--[0-->');
			child($$renderer, { props: mergedProps(), ...rootState.snippetProps });
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push(`<!--[-1--><div${$.attributes({ ...mergedProps() })}>`);
			children?.($$renderer, rootState.snippetProps);
			$$renderer.push(`<!----></div>`);
		}

		$$renderer.push(`<!--]-->`);
		$.bind_props($$props, { ref, value, placeholder });
	});
}