import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { RangeCalendar } from "../../src/index";

var root = $.from_html(`<div class="demo-box"><h3>Range Calendar</h3> <div class="demo-hscroll"><!></div> <div class="demo-hscroll"><!></div></div> <div class="demo-box"><h3>Range Calendar without buttons</h3> <div class="demo-hscroll"><!></div></div> <div class="demo-box"><h3>Range Calendar with Done button</h3> <div class="demo-hscroll"><!></div></div> <div class="demo-box" style="width: 160px"><h3>Single month</h3> <!></div>`, 1);

export default function RangeCalendar_1($$anchor, $$props) {
	$.push($$props, true);

	var fragment = root();
	var div = $.first_child(fragment);
	var div_1 = $.sibling($.child(div), 2);
	var node = $.child(div_1);

	RangeCalendar(node, { start: new Date(2022, 2, 18), end: new Date(2022, 2, 22) });
	$.reset(div_1);

	var div_2 = $.sibling(div_1, 2);
	var node_1 = $.child(div_2);

	RangeCalendar(node_1, { start: new Date(2022, 1, 18), end: new Date(2022, 2, 22) });
	$.reset(div_2);
	$.reset(div);

	var div_3 = $.sibling(div, 2);
	var div_4 = $.sibling($.child(div_3), 2);
	var node_2 = $.child(div_4);

	RangeCalendar(node_2, { buttons: false });
	$.reset(div_4);
	$.reset(div_3);

	var div_5 = $.sibling(div_3, 2);
	var div_6 = $.sibling($.child(div_5), 2);
	var node_3 = $.child(div_6);

	RangeCalendar(node_3, { buttons: ["done", "clear", "today"] });
	$.reset(div_6);
	$.reset(div_5);

	var div_7 = $.sibling(div_5, 2);
	var node_4 = $.sibling($.child(div_7), 2);

	RangeCalendar(node_4, { months: 1 });
	$.reset(div_7);
	$.append($$anchor, fragment);
	$.pop();
}