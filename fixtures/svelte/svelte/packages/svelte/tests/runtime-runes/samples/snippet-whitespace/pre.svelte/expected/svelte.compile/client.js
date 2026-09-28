import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<pre><!></pre>`);

export default function Pre($$anchor, $$props) {
	var pre = root();
	var node = $.child(pre);

	$.snippet(node, () => $$props.children);
	$.reset(pre);
	$.append($$anchor, pre);
}