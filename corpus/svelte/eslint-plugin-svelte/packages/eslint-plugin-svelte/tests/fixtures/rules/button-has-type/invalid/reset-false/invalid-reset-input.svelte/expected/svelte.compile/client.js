import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button type="reset">Hello World</button>`);

export default function Invalid_reset_input($$anchor) {
	var button = root();

	$.append($$anchor, button);
}