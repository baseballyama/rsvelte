import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div></div>`);

export default function Child($$anchor, $$props) {
	$.push($$props, true);

	let x;

	$.user_effect(() => console.log(!!x));

	var div = root();

	$.bind_this(div, ($$value) => x = $$value, () => x);
	$.append($$anchor, div);
	$.pop();
}