import * as $ from 'svelte/internal/server';
import { getContext } from "svelte";
import { uid, dateToString } from "@svar-ui/lib-dom";
import Text from "../Text.svelte";
import Dropdown from "../Dropdown.svelte";
import RangeCalendar from "../RangeCalendar.svelte";

export default function Layout($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			value = void 0,
			id = uid(),
			disabled = false,
			error = false,
			width = "unset",
			align = "start",
			placeholder = "",
			css = "",
			title = "",
			format = "",
			months = 2,
			buttons = ["clear", "today"],
			editable = false,
			clear = false,
			onchange
		} = $$props;

		const { calendar: calendarLocale, formats } = getContext("wx-i18n").getRaw();
		const f = format || formats?.dateFormat;
		let dateFormat = typeof f === "function" ? f : dateToString(f, calendarLocale);
		let popup = void 0;

		function oncancel() {
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

		$$renderer.push(`<div${$.attr_class('wx-daterangepicker svelte-1pj8s4q', void 0, { 'wx-disabled': disabled, 'wx-error': error })}>`);

		Text($$renderer, {
			css,
			title,
			value: formattedValue(),
			id,
			readonly: !editable,
			disabled,
			placeholder,
			error,
			onchange: doInputChange,
			icon: 'wxi-calendar',
			inputStyle: 'cursor: pointer; width: 100%; padding-right: calc(var(--wx-input-icon-size) + var(--wx-input-icon-indent) * 2);',
			clear
		});

		$$renderer.push(`<!----> `);

		if (popup && !disabled) {
			$$renderer.push('<!--[0-->');

			Dropdown($$renderer, {
				oncancel,
				width,
				align,
				autoFit: !!align,
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
			});
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div>`);
		$.bind_props($$props, { value });
	});
}