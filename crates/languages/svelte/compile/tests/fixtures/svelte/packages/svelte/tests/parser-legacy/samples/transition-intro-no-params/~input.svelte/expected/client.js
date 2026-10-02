import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div>fades in</div>`);

export default function Input($$anchor) {
	var div = root();

	$.transition(1, div, () => fade);
	$.append($$anchor, div);
}