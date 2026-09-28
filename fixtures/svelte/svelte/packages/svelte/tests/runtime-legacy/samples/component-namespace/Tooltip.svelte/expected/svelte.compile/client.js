import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p>i am a widget</p>`);

export default function Tooltip($$anchor) {
	var p = root();

	$.append($$anchor, p);
}