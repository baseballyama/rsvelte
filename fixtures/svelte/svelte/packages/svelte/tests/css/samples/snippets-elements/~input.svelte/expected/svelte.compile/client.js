import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

const foo = ($$anchor) => {
	var x = root();

	$.append($$anchor, x);
};

var root = $.from_html(`<x class="svelte-1y5fmrl"><y class="svelte-1y5fmrl"></y></x>`);

export default function Input($$anchor) {
	foo($$anchor);
}