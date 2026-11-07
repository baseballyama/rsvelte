import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<span class="myClass svelte-2goq89">Hello!</span>`);

export default function One_line_css_input($$anchor) {
	let a = 10;
	var span = root();

	$.append($$anchor, span);
}