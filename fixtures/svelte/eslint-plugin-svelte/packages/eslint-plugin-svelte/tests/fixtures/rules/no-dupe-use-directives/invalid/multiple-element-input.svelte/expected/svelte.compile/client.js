import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div><div><div></div> <div></div> <div></div> <div></div> <div></div></div> <div><div></div> <div></div> <div></div> <div></div> <div></div></div></div>`);

export default function Multiple_element_input($$anchor) {
	function foo() {}

	var div = root();
	var div_1 = $.child(div);
	var div_2 = $.child(div_1);

	$.action(div_2, ($$node) => foo?.($$node));

	var div_3 = $.sibling(div_2, 2);

	$.action(div_3, ($$node) => foo?.($$node));
	$.action(div_3, ($$node) => foo?.($$node));

	var div_4 = $.sibling(div_3, 2);

	$.action(div_4, ($$node) => foo?.($$node));

	var div_5 = $.sibling(div_4, 2);

	$.action(div_5, ($$node) => foo?.($$node));
	$.action(div_5, ($$node) => foo?.($$node));

	var div_6 = $.sibling(div_5, 2);

	$.action(div_6, ($$node) => foo?.($$node));
	$.reset(div_1);
	$.action(div_1, ($$node) => foo?.($$node));
	$.action(div_1, ($$node) => foo?.($$node));

	var div_7 = $.sibling(div_1, 2);
	var div_8 = $.child(div_7);

	$.action(div_8, ($$node) => foo?.($$node));
	$.action(div_8, ($$node) => foo?.($$node));

	var div_9 = $.sibling(div_8, 2);

	$.action(div_9, ($$node) => foo?.($$node));

	var div_10 = $.sibling(div_9, 2);

	$.action(div_10, ($$node) => foo?.($$node));
	$.action(div_10, ($$node) => foo?.($$node));

	var div_11 = $.sibling(div_10, 2);

	$.action(div_11, ($$node) => foo?.($$node));

	var div_12 = $.sibling(div_11, 2);

	$.action(div_12, ($$node) => foo?.($$node));
	$.action(div_12, ($$node) => foo?.($$node));
	$.reset(div_7);
	$.action(div_7, ($$node) => foo?.($$node));
	$.reset(div);
	$.action(div, ($$node) => foo?.($$node));
	$.action(div, ($$node) => foo?.($$node));
	$.append($$anchor, div);
}