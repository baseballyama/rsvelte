import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div a-foo="" b-foo="" c-foo=""></div> <div a-b="" a-a="" a-c=""></div> <div b-c="" b-b="" b-a=""></div> <div c-c="" c-b="" c-a=""></div>`, 1);

export default function Alphabetical_test_input($$anchor) {
	var fragment = root();

	$.next(6);
	$.append($$anchor, fragment);
}