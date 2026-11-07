import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

const test = ($$anchor) => {
	var p = root();

	$.append($$anchor, p);
};

var root = $.from_html(`<p>hello</p>`);

export default function Main($$anchor) {
	test();
}