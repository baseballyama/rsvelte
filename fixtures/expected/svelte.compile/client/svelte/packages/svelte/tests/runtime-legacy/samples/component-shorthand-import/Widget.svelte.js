import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p>This is the widget.</p>`);

export default function Widget($$anchor) {
	var p = root();

	$.append($$anchor, p);
}