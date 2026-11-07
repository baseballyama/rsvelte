import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_svg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="currentColor" d="M6 21v-3H3v-2h5v5zm10 0v-5h5v2h-3v3zM3 8V6h3V3h2v5zm13 0V3h2v3h3v2z"></path></svg>`);

export default function FullscreenExit($$anchor) {
	var svg = root();

	$.append($$anchor, svg);
}