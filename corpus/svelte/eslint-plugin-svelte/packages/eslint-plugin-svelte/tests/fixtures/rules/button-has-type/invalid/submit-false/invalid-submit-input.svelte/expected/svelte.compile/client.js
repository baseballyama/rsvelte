import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button type="submit">Hello World</button>`);

export default function Invalid_submit_input($$anchor) {
	var button = root();

	$.append($$anchor, button);
}