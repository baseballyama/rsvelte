import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<span><!></span>`);

export default function Span($$anchor, $$props) {
	var span = root();
	var node = $.child(span);

	$.slot(node, $$props, 'default', {}, null);
	$.reset(span);
	$.append($$anchor, span);
}