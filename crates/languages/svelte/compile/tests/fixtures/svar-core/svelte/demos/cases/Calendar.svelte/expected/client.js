import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Calendar, Locale } from "../../src/index";
import { de, cn } from "@svar-ui/core-locales";

var root = $.from_html(`<div class="demo-box"><h3>Calendar</h3> <div class="calendars svelte-1k56x1f"><!> <!> <!></div></div> <div class="demo-box"><h3>Calendar with Locale and Format</h3> <div class="calendars svelte-1k56x1f"><!> <!> <!></div></div> <div class="calendars svelte-1k56x1f"><div class="demo-box"><h3>Calendar without buttons</h3> <!></div> <div class="demo-box" style="width: 300px; margin-top: 20px"><h3>Calendar with Today button only</h3> <!></div></div>`, 1);

export default function Calendar_1($$anchor, $$props) {
	$.push($$props, true);

	const markLine = (v) => v >= new Date(2022, 2, 13) && v <= new Date(2022, 2, 19) ? "inrange" : "";
	const markLine2 = (v) => v >= new Date(2022, 2, 8) && v <= new Date(2022, 2, 29) ? "inrange" : "";
	var fragment = root();
	var div = $.first_child(fragment);
	var div_1 = $.sibling($.child(div), 2);
	var node = $.child(div_1);

	Calendar(node, { value: new Date(2022, 2, 18) });

	var node_1 = $.sibling(node, 2);

	Calendar(node_1, { current: new Date(2022, 2, 18), markers: markLine });

	var node_2 = $.sibling(node_1, 2);

	Calendar(node_2, { current: new Date(2022, 2, 18), markers: markLine2 });
	$.reset(div_1);
	$.reset(div);

	var div_2 = $.sibling(div, 2);
	var div_3 = $.sibling($.child(div_2), 2);
	var node_3 = $.child(div_3);

	Locale(node_3, {
		get words() {
			return de;
		},

		children: ($$anchor, $$slotProps) => {
			Calendar($$anchor, { value: new Date(2022, 2, 18) });
		},
		$$slots: { default: true }
	});

	var node_4 = $.sibling(node_3, 2);

	Locale(node_4, {
		get words() {
			return cn;
		},

		children: ($$anchor, $$slotProps) => {
			Calendar($$anchor, { value: new Date(2022, 2, 18) });
		},
		$$slots: { default: true }
	});

	var node_5 = $.sibling(node_4, 2);

	{
		let $0 = $.derived(() => ({
			...cn,
			formats: { ...cn.formats, monthYearFormat: "%Y年%F", yearFormat: "%Y年" }
		}));

		Locale(node_5, {
			get words() {
				return $.get($0);
			},

			children: ($$anchor, $$slotProps) => {
				Calendar($$anchor, { value: new Date(2022, 2, 18) });
			},
			$$slots: { default: true }
		});
	}

	$.reset(div_3);
	$.reset(div_2);

	var div_4 = $.sibling(div_2, 2);
	var div_5 = $.child(div_4);
	var node_6 = $.sibling($.child(div_5), 2);

	Calendar(node_6, { value: new Date(2022, 2, 18), buttons: false });
	$.reset(div_5);

	var div_6 = $.sibling(div_5, 2);
	var node_7 = $.sibling($.child(div_6), 2);

	Calendar(node_7, { value: new Date(2022, 2, 18), buttons: ["today"] });
	$.reset(div_6);
	$.reset(div_4);
	$.append($$anchor, fragment);
	$.pop();
}