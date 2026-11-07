import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<!> <meta name="nested" content="nested"/>`, 1);

export default function Nested($$anchor) {
	$.head('16v3bot', ($$anchor) => {
		var fragment = root();
		var node = $.first_child(fragment);

		$.html(node, () => '<meta name="nested_html" content="nested_html">');
		$.next(2);
		$.append($$anchor, fragment);
	});
}