import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<input disabled="" hidden=""/>`);

export default function Main($$anchor) {
	var input = root();

	$.append($$anchor, input);
}