import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<blockquote class="mt-6 border-s-2 ps-6 italic">"After all," he said, "everyone enjoys a good joke, so it's only fair that they should pay for the
	privilege."</blockquote>`);

export default function Typography_blockquote($$anchor) {
	var blockquote = root();

	$.append($$anchor, blockquote);
}