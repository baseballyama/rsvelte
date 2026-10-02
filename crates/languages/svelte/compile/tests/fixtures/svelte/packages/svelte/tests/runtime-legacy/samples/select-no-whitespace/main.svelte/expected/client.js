import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<select><option>a</option><option>b</option><option>c</option></select>`);

export default function Main($$anchor) {
	var select = root();

	$.append($$anchor, select);
}