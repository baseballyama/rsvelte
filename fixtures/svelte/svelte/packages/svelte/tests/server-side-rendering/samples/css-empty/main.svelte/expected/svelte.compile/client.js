import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div class="foo svelte-1hh8xo8">foo</div>`);

export default function Main($$anchor) {
	var div = root();

	$.append($$anchor, div);
}