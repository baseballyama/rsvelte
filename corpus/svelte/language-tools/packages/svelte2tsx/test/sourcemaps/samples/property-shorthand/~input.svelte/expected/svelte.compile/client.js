import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button>button</button>`);

export default function Input($$anchor) {
	var button = root();

	$.set_attribute(button, 'count', count);
	$.append($$anchor, button);
}