import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_svg(`<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 32 32"><path fill="currentColor" d="M7 19a3 3 0 1 0 0-6a3 3 0 0 0 0 6Zm9 0a3 3 0 1 0 0-6a3 3 0 0 0 0 6Zm9 0a3 3 0 1 0 0-6a3 3 0 0 0 0 6Z"></path></svg>`);

export default function More($$anchor) {
	var svg = root();

	$.append($$anchor, svg);
}