import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div>b</div>`);

export default function ComponentB($$anchor) {
	var div = root();

	$.append($$anchor, div);
}