import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button></button>`);

export default function Fix_missing_function_element($$anchor) {
	var button = root();

	$.event('click', button, handleClick);
	$.append($$anchor, button);
}