import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getContext } from "svelte";
import { delegateClick } from "@svar-ui/lib-dom";
import { defaultLocale } from "../helpers/locale";

var root = $.from_html(`<div class="wx-weekday svelte-1bel263"> </div>`);
var root_1 = $.from_html(`<div> </div>`);
var root_2 = $.from_html(`<div><div class="wx-weekdays svelte-1bel263"></div> <div class="wx-days svelte-1bel263"></div></div>`);

export default function Month($$anchor, $$props) {
	$.push($$props, true);

	let part = $.prop($$props, 'part', 3, ""),
		markers = $.prop($$props, 'markers', 3, null),
		css = $.prop($$props, 'css', 3, "");

	const locale = (getContext("wx-i18n") || defaultLocale()).getRaw().calendar;
	const weekStart = (locale.weekStart || 7) % 7;
	const weekdays = locale.dayShort.slice(weekStart).concat(locale.dayShort.slice(0, weekStart));
	const dv = (d, dm, dd) => new Date(d.getFullYear(), d.getMonth() + (dm || 0), d.getDate() + (dd || 0));
	let ranges = part() !== "normal";

	function isWeekEnd(date) {
		const d = date.getDay();

		return d === 0 || d === 6;
	}

	function getStart() {
		const start = dv($$props.current, 0, 1 - $$props.current.getDate());

		start.setDate(start.getDate() - (start.getDay() - (weekStart - 7)) % 7);

		return start;
	}

	function getEnd() {
		const end = dv($$props.current, 1, -$$props.current.getDate());

		end.setDate(end.getDate() + (6 - end.getDay() + weekStart) % 7);

		return end;
	}

	const selectDates = { click: selectDate };

	function selectDate(date, e) {
		e.stopPropagation();
		$$props.onchange && $$props.onchange(new Date(date));
		$$props.oncancel && $$props.oncancel();
	}

	const date = $.derived(() => {
		if (part() == "normal") return [$$props.value ? dv($$props.value).valueOf() : 0];

		return $$props.value
			? [
				$$props.value.start ? dv($$props.value.start).valueOf() : 0,
				$$props.value.end ? dv($$props.value.end).valueOf() : 0
			]
			: [0, 0];
	});

	const days = $.derived(() => {
		const start = getStart();
		const end = getEnd();
		const curMonth = $$props.current.getMonth();
		let days = [];

		for (let d = start; d <= end; d.setDate(d.getDate() + 1)) {
			const day = {
				day: d.getDate(),
				in: d.getMonth() === curMonth,
				date: d.valueOf()
			};

			let css = "";

			css += !day.in ? " wx-inactive" : "";
			css += $.get(date).indexOf(day.date) > -1 ? " wx-selected" : "";

			if (ranges) {
				const s = day.date == $.get(date)[0];
				const e = day.date == $.get(date)[1];

				if (s && !e) css += " wx-left"; else if (e && !s) css += " wx-right";
				if (day.date > $.get(date)[0] && day.date < $.get(date)[1]) css += " wx-inrange";
			}

			css += isWeekEnd(d) ? " wx-weekend" : "";

			if (markers()) {
				const mark = markers()(d);

				if (mark) css += " " + mark;
			}

			days.push({ ...day, css });
		}

		return days;
	});

	var div = root_2();
	var div_1 = $.child(div);

	$.each(div_1, 21, () => weekdays, $.index, ($$anchor, day) => {
		var div_2 = root();
		var text = $.only_child(div_2, true);

		$.template_effect(() => $.set_text(text, $.get(day)));
		$.append($$anchor, div_2);
	});

	$.reset(div_1);

	var div_3 = $.sibling(div_1, 2);

	$.each(div_3, 21, () => $.get(days), (day) => day.date, ($$anchor, day) => {
		var div_4 = root_1();
		let classes;
		var text_1 = $.only_child(div_4, true);

		$.template_effect(() => {
			classes = $.set_class(div_4, 1, `wx-day ${$.get(day).css ?? ''}`, 'svelte-1bel263', classes, { 'wx-out': !$.get(day).in });
			$.set_attribute(div_4, 'data-id', $.get(day).date);
			$.set_text(text_1, $.get(day).day);
		});

		$.append($$anchor, div_4);
	});

	$.reset(div_3);
	$.action(div_3, ($$node, $$action_arg) => delegateClick?.($$node, $$action_arg), () => selectDates);
	$.reset(div);
	$.template_effect(() => $.set_class(div, 1, `wx-month ${css() ?? ''}`, 'svelte-1bel263'));
	$.append($$anchor, div);
	$.pop();
}