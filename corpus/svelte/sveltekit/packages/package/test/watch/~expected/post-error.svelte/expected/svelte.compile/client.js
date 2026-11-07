import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button>click me</button>`);

export default function Post_error($$anchor) {
	var button = root();

	$.event('click', button, foo);
	$.append($$anchor, button);
}