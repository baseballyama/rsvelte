import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<span>world</span>`);

export default function World($$anchor) {
	var span = root();

	$.append($$anchor, span);
}