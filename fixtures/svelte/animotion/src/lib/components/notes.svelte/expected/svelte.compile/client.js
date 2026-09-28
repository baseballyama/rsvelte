import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<aside class="notes"><!></aside>`);

export default function Notes($$anchor, $$props) {
	var aside = root();
	var node = $.child(aside);

	$.snippet(node, () => $$props.children);
	$.reset(aside);
	$.append($$anchor, aside);
}