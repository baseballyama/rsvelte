import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button></button>`);

export default function _3_input($$anchor) {
	var button = root();

	button.textContent = `count: ${count ?? ''}`;
	$.event('click', button, () => count += 1);
	$.append($$anchor, button);
}