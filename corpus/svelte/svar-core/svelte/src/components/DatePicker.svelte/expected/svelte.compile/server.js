import * as $ from 'svelte/internal/server';
import { getContext } from "svelte";
import { dateToString } from "@svar-ui/lib-dom";
import Text from "./Text.svelte";
import Dropdown from "./Dropdown.svelte";
import Calendar from "./Calendar.svelte";
import { defaultLocale } from "./helpers/locale";
import { toDateDropdown } from "./helpers/dropdown";

export default function DatePicker($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			value = void 0,
			id,
			disabled = false,
			error = false,
			placeholder = "",
			format = "",
			buttons = ["clear", "today"],
			css = "",
			title = "",
			tooltip,
			editable = false,
			clear = false,
			onchange,
			dropdown = {}
		} = $$props;

		const { calendar: calendarLocale, formats } = (getContext("wx-i18n") || defaultLocale()).getRaw();
		const f = format || formats.dateFormat;
		let dateFormat = typeof f === "function" ? f : dateToString(f, calendarLocale);
		let popup = void 0;

		function oncancel() {
			popup = false;
		}

		function doChange(v) {
			// skip "select" event if the same value
			// or different objects with the same value
			const skipEvent = v === value || v && value && v.valueOf() === value.valueOf() || !v && !value;

			value = v;

			if (!skipEvent) {
				onchange && onchange({ value });
			}

			// fire after on-click finished
			setTimeout(oncancel, 1);
		}

		const formattedValue = $.derived(() => value ? dateFormat(value) : "");

		function change({ value: v, input }) {
			if (!editable && !clear) return;
			if (input) return;

			// convert to date, but ignore empty string input
			let date = typeof editable === "function" ? editable(v) : v ? new Date(v) : null;

			// if date is invalid ( incorrect text input ) then use old value
			// else use the entered date
			// in any case fallback to null, to prevent undefined as value
			date = isNaN(date) ? value || null : date || null;

			doChange(date);
		}

		$$renderer.push(`<div class="wx-datepicker svelte-10o1gum">`);

		Text($$renderer, {
			css: `wx-date-input ${css}`,
			title,
			tooltip,
			value: formattedValue(),
			id,
			readonly: !editable,
			disabled,
			error,
			placeholder,
			oninput: oncancel,
			onchange: change,
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
						Calendar($$renderer, { buttons, value, onchange: (e) => doChange(e.value) });
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