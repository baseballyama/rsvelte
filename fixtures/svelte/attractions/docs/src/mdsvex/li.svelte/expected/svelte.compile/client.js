import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<li><!></li>`);

export default function Li($$anchor, $$props) {
	var li = root();
	var node = $.child(li);

	$.slot(node, $$props, 'default', {}, null);
	$.reset(li);
	$.append($$anchor, li);
}