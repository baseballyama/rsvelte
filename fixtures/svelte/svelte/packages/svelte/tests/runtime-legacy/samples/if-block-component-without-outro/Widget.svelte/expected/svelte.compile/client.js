import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div>A wild component appears</div>`);

export default function Widget($$anchor) {
	var div = root();

	$.append($$anchor, div);
}