import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getContext } from "svelte";
import { delegateClick } from "@svar-ui/lib-dom";
import Button from "./Button.svelte";
import { getPartValue } from "./helpers";

var root = $.from_html(`<div> </div>`);
var root_1 = $.from_html(`<div class="wx-months svelte-1nbu5oq"></div> <div class="wx-buttons svelte-1nbu5oq"><!></div>`, 1);

export default function Year($$anchor, $$props) {
	$.push($$props, true);

	let value = $.prop($$props, 'value', 15),
		current = $.prop($$props, 'current', 15);

	const locale = getContext("wx-i18n").getRaw().calendar;
	const months = locale.monthShort;
	const monthNum = $.derived(() => current().getMonth());
	const selectMonths = { click: selectMonth };

	function selectMonth(month, e) {
		if (month || month === 0) {
			e.stopPropagation();
			current().setMonth(month);
			current(new Date(current()));
			$$props.onshift && $$props.onshift({});
		}

		if ($$props.part === "normal") value(new Date(current()));

		$$props.oncancel && $$props.oncancel();
	}

	function done() {
		const date = new Date(getPartValue(value(), $$props.part) || current());

		date.setMonth(current().getMonth());
		date.setFullYear(current().getFullYear());
		$$props.onchange && $$props.onchange(date);
	}

	var fragment = root_1();
	var div = $.first_child(fragment);

	$.each(div, 21, () => months, $.index, ($$anchor, month, i) => {
		var div_1 = root();
		let classes;

		$.set_attribute(div_1, 'data-id', i);

		var text = $.only_child(div_1, true);

		$.template_effect(() => {
			classes = $.set_class(div_1, 1, 'wx-month svelte-1nbu5oq', null, classes, { 'wx-current': $.get(monthNum) === i });
			$.set_text(text, $.get(month));
		});

		$.append($$anchor, div_1);
	});

	$.reset(div);
	$.action(div, ($$node, $$action_arg) => delegateClick?.($$node, $$action_arg), () => selectMonths);

	var div_2 = $.sibling(div, 2);
	var node = $.child(div_2);

	Button(node, {
		onclick: done,
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text();

			$.template_effect(() => $.set_text(text_1, locale.done));
			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	$.reset(div_2);
	$.append($$anchor, fragment);
	$.pop();
}