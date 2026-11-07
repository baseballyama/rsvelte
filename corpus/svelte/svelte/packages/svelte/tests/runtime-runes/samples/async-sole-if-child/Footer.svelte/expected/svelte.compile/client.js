import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<footer>footer</footer>`);

export default function Footer($$anchor) {
	var footer = root();

	$.append($$anchor, footer);
}