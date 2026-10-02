import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button id="an:invalid+selector">I have a weird ID but I should be focused</button>`);

export default function _page($$anchor) {
	var button = root();

	$.append($$anchor, button);
}