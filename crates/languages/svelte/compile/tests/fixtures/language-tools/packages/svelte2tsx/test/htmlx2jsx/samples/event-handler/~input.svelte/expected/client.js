import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<h1>Hello</h1>`);

export default function Input($$anchor) {
	var h1 = root();

	$.event('click', h1, () => console.log("click"));
	$.event('UpperCaseEvent', h1, () => log('hi'));
	$.append($$anchor, h1);
}