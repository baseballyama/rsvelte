import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<input class="wont-focus"/> <input class="will-focus"/>`, 1);

export default function Main($$anchor) {
	var fragment = root();
	var input = $.sibling($.first_child(fragment), 2);

	$.event('click', input, (e) => e.target.focus());
	$.append($$anchor, fragment);
}