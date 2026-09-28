import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div><span>something</span></div>`);

export default function Main($$anchor) {
	let test = 42;
	var div = root();

	$.template_effect(() => {
		console.log({ test: $.snapshot(test) });

		debugger;
	});

	$.append($$anchor, div);
}