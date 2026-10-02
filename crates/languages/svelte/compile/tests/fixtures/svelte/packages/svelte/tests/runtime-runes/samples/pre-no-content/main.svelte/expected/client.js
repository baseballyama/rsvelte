import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<pre></pre>`);

export default function Main($$anchor) {
	var pre = root();

	$.append($$anchor, pre);
}