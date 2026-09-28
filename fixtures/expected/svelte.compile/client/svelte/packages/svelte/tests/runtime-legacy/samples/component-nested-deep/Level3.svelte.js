import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<span>level 3</span>`);

export default function Level3($$anchor) {
	var span = root();

	$.append($$anchor, span);
}