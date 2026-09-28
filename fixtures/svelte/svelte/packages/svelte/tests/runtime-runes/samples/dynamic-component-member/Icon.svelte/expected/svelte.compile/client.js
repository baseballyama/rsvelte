import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<span>x</span>`);

export default function Icon($$anchor) {
	var span = root();

	$.append($$anchor, span);
}