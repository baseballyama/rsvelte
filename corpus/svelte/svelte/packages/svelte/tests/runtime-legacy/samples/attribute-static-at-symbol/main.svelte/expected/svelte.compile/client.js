import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<a href="mailto:hello@example.com">email</a>`);

export default function Main($$anchor) {
	var a = root();

	$.append($$anchor, a);
}