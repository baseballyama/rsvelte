import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<header>header</header>`);

export default function Header($$anchor) {
	var header = root();

	$.append($$anchor, header);
}