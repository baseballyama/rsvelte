import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div order-a="" order-b="" order-c=""></div> <div a="" b="" c=""></div> <div c="" b="" a=""></div> <div h="" g="" f="" e="" order-a="" order-b="" d="" c="" order-c="" b="" a=""></div>`, 1);

export default function Ignore_no_order_test_output($$anchor) {
	var fragment = root();

	$.next(6);
	$.append($$anchor, fragment);
}