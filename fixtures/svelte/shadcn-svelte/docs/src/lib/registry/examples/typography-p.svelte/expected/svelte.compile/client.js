import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p class="leading-7 [&amp;:not(:first-child)]:mt-6">The king, seeing how much happier his subjects were, realized the error of his ways and repealed
	the joke tax.</p>`);

export default function Typography_p($$anchor) {
	var p = root();

	$.append($$anchor, p);
}