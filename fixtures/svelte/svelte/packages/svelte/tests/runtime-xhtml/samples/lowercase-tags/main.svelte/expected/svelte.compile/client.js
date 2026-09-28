import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<input disabled=""/>`);

export default function Main($$anchor) {
	var iNPUT = root();

	$.append($$anchor, iNPUT);
}