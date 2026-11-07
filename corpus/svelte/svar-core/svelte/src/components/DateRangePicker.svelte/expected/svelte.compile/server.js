import * as $ from 'svelte/internal/server';
import { getContext } from "svelte";
import { dateToString } from "@svar-ui/lib-dom";
import Text from "./Text.svelte";
import Dropdown from "./Dropdown.svelte";
import RangeCalendar from "./RangeCalendar.svelte";
import { defaultLocale } from "./helpers/locale";
import { toDateDropdown } from "./helpers/dropdown";

export default function DateRangePicker($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			value = void 0,
			id,
			disabled = false,
			error = false,
			placeholder = "",
			css = "",
			title = "",
			tooltip,
			format = "",
			months = 2,
			buttons = ["clear", "today"],
			editable = false,
			clear = false,
			onchange,
			dropdown
		} = $$props;

		const { calendar: calendarLocale, formats } = (getContext("wx-i18n") || defaultLocale()).getRaw();
		const f = format || formats?.dateFormat;
		let dateFormat = typeof f === "function" ? f : dateToString(f, calendarLocale);
		let popup = void 0;

		function oncancel() {
			// popup was closed before full range selected
			if (value && value.start && !value.end) onchange && onchange({ value });

			popup = false;
		}

		let formattedValue = $.derived(() => value
			? value.start
				? dateFormat(value.start) + (value.end ? ` - ${dateFormat(value.end)}` : "")
				: dateFormat(value)
			: "");

		function doChange(d) {
			value = d.start || d.end ? { start: d.start, end: d.end } : null;

			// fire after on-click finished
			if (d.start && d.end || !d.start && !d.end) {
				// FIXME - select event will trigger even if the same value
				onchange && onchange({ value });

				setTimeout(oncancel, 1);
			}
		}

		function doInputChange(ev) {
			if (!editable && !clear) return;

			const { value: v, input } = ev;

			if (input) return;

			const [s, e] = v.split(" -").map((a, i) => {
				const av = a.trim();
				let date = typeof editable === "function" ? editable(av) : av ? new Date(av) : null;

				// if date is invalid ( incorrect text input ) then use old value
				// else use the entered date
				// in any case fallback to null, to prevent undefined as value
				let value = i === 0 ? start() : end();

				return isNaN(date) ? value ? value : null : date || null;
			});

			doChange({ start: s, end: e });
		}

		const start = $.derived(() => value ? value.start || null : null);
		const end = $.derived(() => value ? value.end || null : null);

		$$renderer.push(`<div${$.attr_class('wx-daterangepicker svelte-19yqpdd', void 0, { 'wx-disabled': disabled, 'wx-error': error })}>`);

		Text($$renderer, {
			css: `wx-date-input ${css}`,
			title,
			tooltip,
			value: formattedValue(),
			id,
			readonly: !editable,
			disabled,
			placeholder,
			error,
			onchange: doInputChange,
			icon: 'wxi-calendar',
			clear
		});

		$$renderer.push(`<!----> `);

		if (popup && !disabled) {
			$$renderer.push('<!--[0-->');

			Dropdown($$renderer, $.spread_props([
				{ oncancel },
				toDateDropdown(dropdown),
				{
					children: ($$renderer) => {
						RangeCalendar($$renderer, {
							oncancel,
							buttons,
							start: start(),
							end: end(),
							months,
							onchange: doChange
						});
					},
					$$slots: { default: true }
				}
			]));
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div>`);
		$.bind_props($$props, { value });
	});
}