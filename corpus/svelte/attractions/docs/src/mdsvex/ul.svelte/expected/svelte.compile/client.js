import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<ul><!></ul>`);

export default function Ul($$anchor, $$props) {
	var ul = root();
	var node = $.child(ul);

	$.slot(node, $$props, 'default', {}, null);
	$.reset(ul);
	$.append($$anchor, ul);
}