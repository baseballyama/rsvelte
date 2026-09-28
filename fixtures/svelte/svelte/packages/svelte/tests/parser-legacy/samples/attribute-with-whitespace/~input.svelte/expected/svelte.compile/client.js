import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button>Click</button>`);

export default function Input($$anchor) {
	var button = root();

	$.event('click', button, foo);
	$.append($$anchor, button);
}