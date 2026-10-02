import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_svg(`<svg fill="none" height="24" shape-rendering="geometricPrecision" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" viewBox="0 0 24 24" width="24"><path d="M12 5v14"></path><path d="M5 12h14"></path></svg>`);

export default function Plus($$anchor) {
	var svg = root();

	$.append($$anchor, svg);
}