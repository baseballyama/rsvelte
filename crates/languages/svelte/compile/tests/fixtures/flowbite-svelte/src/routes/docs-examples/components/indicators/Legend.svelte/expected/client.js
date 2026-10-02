import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Indicator } from "flowbite-svelte";

var root = $.from_html(`<span class="flex items-center"><!>Visitors</span> <span class="flex items-center"><!>Sessions</span> <span class="flex items-center"><!>Customers</span> <span class="flex items-center"><!>Revenue</span>`, 1);

export default function Legend($$anchor) {
	var fragment = root();
	var span = $.first_child(fragment);
	var node = $.child(span);

	Indicator(node, { size: 'sm', color: 'orange', class: 'me-1.5' });
	$.next();
	$.reset(span);

	var span_1 = $.sibling(span, 2);
	var node_1 = $.child(span_1);

	Indicator(node_1, { size: 'sm', color: 'purple', class: 'me-1.5' });
	$.next();
	$.reset(span_1);

	var span_2 = $.sibling(span_1, 2);
	var node_2 = $.child(span_2);

	Indicator(node_2, { size: 'sm', color: 'indigo', class: 'me-1.5' });
	$.next();
	$.reset(span_2);

	var span_3 = $.sibling(span_2, 2);
	var node_3 = $.child(span_3);

	Indicator(node_3, { size: 'sm', color: 'teal', class: 'me-1.5' });
	$.next();
	$.reset(span_3);
	$.append($$anchor, fragment);
}