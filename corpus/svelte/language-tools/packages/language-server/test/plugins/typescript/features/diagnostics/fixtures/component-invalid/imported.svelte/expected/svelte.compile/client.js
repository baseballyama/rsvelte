import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p>hi</p>`);

export default function Imported($$anchor) {
	var p = root();

	$.append($$anchor, p);
}