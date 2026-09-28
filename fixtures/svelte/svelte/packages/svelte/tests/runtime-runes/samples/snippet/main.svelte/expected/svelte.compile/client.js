import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

const hello = ($$anchor) => {
	var p = root();

	$.append($$anchor, p);
};

var root = $.from_html(`<p>hello world</p>`);

export default function Main($$anchor) {
	hello($$anchor);
}