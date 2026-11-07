import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div order-b="" order-c="" order-a=""></div> <div a="" b="" c=""></div> <div c="" b="" a=""></div> <div h="" g="" f="" e="" order-b="" d="" order-a="" c="" order-c="" b="" a=""></div>`, 1);

export default function Ignore_no_order_test_input($$anchor) {
	var fragment = root();

	$.next(6);
	$.append($$anchor, fragment);
}