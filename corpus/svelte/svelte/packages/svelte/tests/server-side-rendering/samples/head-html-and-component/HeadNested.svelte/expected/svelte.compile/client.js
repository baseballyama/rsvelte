import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<!> <meta name="head_nested" content="head_nested"/>`, 1);

export default function HeadNested($$anchor) {
	var fragment = root();
	var node = $.first_child(fragment);

	$.html(node, () => '<meta name="head_nested_html" content="head_nested_html">');
	$.next(2);
	$.append($$anchor, fragment);
}