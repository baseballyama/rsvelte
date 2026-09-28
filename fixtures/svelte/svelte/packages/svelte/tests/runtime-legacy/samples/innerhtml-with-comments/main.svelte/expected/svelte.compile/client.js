import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<span>Style: <a href="https://getbootstrap.com/" target="_blank">Bootstrap</a>.</span>`);

export default function Main($$anchor) {
	var span = root();

	$.append($$anchor, span);
}