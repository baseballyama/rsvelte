import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<span>test</span>`);

export default function Main($$anchor) {
	var span = root();

	$.append($$anchor, span);
}