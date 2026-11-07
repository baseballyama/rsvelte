import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div b-foo="" a-foo="" c-foo=""></div> <div a-b="" a-a="" a-c=""></div> <div b-c="" b-b="" b-a=""></div> <div c-b="" c-c="" c-a=""></div>`, 1);

export default function Alphabetical_test_output($$anchor) {
	var fragment = root();

	$.next(6);
	$.append($$anchor, fragment);
}