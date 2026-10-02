import * as $ from 'svelte/internal/server';
import { getContext } from "svelte";
import { delegateClick } from "@svar-ui/lib-dom";
import { defaultLocale } from "../helpers/locale";

export default function Month($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			value,
			current = void 0,
			part = "",
			markers = null,
			css = "",
			oncancel,
			onchange
		} = $$props;

		const locale = (getContext("wx-i18n") || defaultLocale()).getRaw().calendar;
		const weekStart = (locale.weekStart || 7) % 7;
		const weekdays = locale.dayShort.slice(weekStart).concat(locale.dayShort.slice(0, weekStart));
		const dv = (d, dm, dd) => new Date(d.getFullYear(), d.getMonth() + (dm || 0), d.getDate() + (dd || 0));
		let ranges = part !== "normal";

		function isWeekEnd(date) {
			const d = date.getDay();

			return d === 0 || d === 6;
		}

		function getStart() {
			const start = dv(current, 0, 1 - current.getDate());

			start.setDate(start.getDate() - (start.getDay() - (weekStart - 7)) % 7);

			return start;
		}

		function getEnd() {
			const end = dv(current, 1, -current.getDate());

			end.setDate(end.getDate() + (6 - end.getDay() + weekStart) % 7);

			return end;
		}

		const selectDates = { click: selectDate };

		function selectDate(date, e) {
			e.stopPropagation();
			onchange && onchange(new Date(date));
			oncancel && oncancel();
		}

		const date = $.derived(() => {
			if (part == "normal") return [value ? dv(value).valueOf() : 0];

			return value
				? [
					value.start ? dv(value.start).valueOf() : 0,
					value.end ? dv(value.end).valueOf() : 0
				]
				: [0, 0];
		});

		const days = $.derived(() => {
			const start = getStart();
			const end = getEnd();
			const curMonth = current.getMonth();
			let days = [];

			for (let d = start; d <= end; d.setDate(d.getDate() + 1)) {
				const day = {
					day: d.getDate(),
					in: d.getMonth() === curMonth,
					date: d.valueOf()
				};

				let css = "";

				css += !day.in ? " wx-inactive" : "";
				css += date().indexOf(day.date) > -1 ? " wx-selected" : "";

				if (ranges) {
					const s = day.date == date()[0];
					const e = day.date == date()[1];

					if (s && !e) css += " wx-left"; else if (e && !s) css += " wx-right";
					if (day.date > date()[0] && day.date < date()[1]) css += " wx-inrange";
				}

				css += isWeekEnd(d) ? " wx-weekend" : "";

				if (markers) {
					const mark = markers(d);

					if (mark) css += " " + mark;
				}

				days.push({ ...day, css });
			}

			return days;
		});

		$$renderer.push(`<div${$.attr_class(`wx-month ${$.stringify(css)}`, 'svelte-1bel263')}><div class="wx-weekdays svelte-1bel263"><!--[-->`);

		const each_array = $.ensure_array_like(weekdays);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let day = each_array[$$index];

			$$renderer.push(`<div class="wx-weekday svelte-1bel263">${$.escape(day)}</div>`);
		}

		$$renderer.push(`<!--]--></div> <div class="wx-days svelte-1bel263"><!--[-->`);

		const each_array_1 = $.ensure_array_like(days());

		for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
			let day = each_array_1[$$index_1];

			$$renderer.push(`<div${$.attr_class(`wx-day ${$.stringify(day.css)}`, 'svelte-1bel263', { 'wx-out': !day.in })}${$.attr('data-id', day.date)}>${$.escape(day.day)}</div>`);
		}

		$$renderer.push(`<!--]--></div></div>`);
		$.bind_props($$props, { current });
	});
}