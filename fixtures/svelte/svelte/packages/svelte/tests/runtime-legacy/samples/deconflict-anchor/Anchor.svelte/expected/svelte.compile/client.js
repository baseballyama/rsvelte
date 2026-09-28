import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p>Anchor</p>`);

export default function Anchor($$anchor) {
	var p = root();

	$.append($$anchor, p);
}