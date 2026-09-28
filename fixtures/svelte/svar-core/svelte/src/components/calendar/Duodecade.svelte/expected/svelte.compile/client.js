import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getContext } from "svelte";
import { getDuodecade, delegateClick } from "@svar-ui/lib-dom";
import Button from "./Button.svelte";
import { getPartValue } from "./helpers";

var root = $.from_html(`<div> </div>`);
var root_1 = $.from_html(`<div class="wx-years svelte-1qvxscp"></div> <div class="wx-buttons svelte-1qvxscp"><!></div>`, 1);

export default function Duodecade($$anchor, $$props) {
	$.push($$props, true);

	const _ = getContext("wx-i18n").getRaw().calendar;

	let value = $.prop($$props, 'value', 15),
		current = $.prop($$props, 'current', 15);

	const year = $.derived(() => current().getFullYear());

	const years = $.derived(() => {
		const { start, end } = getDuodecade($.get(year));
		const years = [];

		for (let y = start; y <= end; ++y) {
			years.push(y);
		}

		return years;
	});

	const selectYears = { click: selectYear };

	function selectYear(year, e) {
		if (year) {
			e.stopPropagation();
			current().setFullYear(year);
			current(new Date(current()));
			$$props.onshift && $$props.onshift({});
		}

		if ($$props.part === "normal") value(new Date(current()));

		$$props.oncancel && $$props.oncancel();
	}

	function done() {
		const date = new Date(getPartValue(value(), $$props.part) || current());

		date.setFullYear(current().getFullYear());
		$$props.onchange && $$props.onchange(date);
	}

	var fragment = root_1();
	var div = $.first_child(fragment);

	$.each(div, 21, () => $.get(years), $.index, ($$anchor, y, i) => {
		var div_1 = root();
		let classes;
		var text = $.only_child(div_1, true);

		$.template_effect(() => {
			classes = $.set_class(div_1, 1, 'wx-year svelte-1qvxscp', null, classes, {
				'wx-current': $.get(year) == $.get(y),
				'wx-prev-decade': i === 0,
				'wx-next-decade': i === 11
			});

			$.set_attribute(div_1, 'data-id', $.get(y));
			$.set_text(text, $.get(y));
		});

		$.append($$anchor, div_1);
	});

	$.reset(div);
	$.action(div, ($$node, $$action_arg) => delegateClick?.($$node, $$action_arg), () => selectYears);

	var div_2 = $.sibling(div, 2);
	var node = $.child(div_2);

	Button(node, {
		onclick: done,
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text();

			$.template_effect(() => $.set_text(text_1, _.done));
			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	$.reset(div_2);
	$.append($$anchor, fragment);
	$.pop();
}