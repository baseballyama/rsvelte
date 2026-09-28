import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div>123</div>`);

export default function Child($$anchor, $$props) {
	$.push($$props, true);

	let div = $.state(void 0);

	$.user_effect(() => {
		console.log($.get(div)?.textContent);
	});

	const someData = '123';
	var $$exports = { someData };
	var div_1 = root();

	$.bind_this(div_1, (v) => $.set(div, v, true), () => $.get(div));
	$.append($$anchor, div_1);

	return $.pop($$exports);
}