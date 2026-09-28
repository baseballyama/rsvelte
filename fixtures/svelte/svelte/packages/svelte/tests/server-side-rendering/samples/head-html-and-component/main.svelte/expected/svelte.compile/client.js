import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import HeadNested from './HeadNested.svelte';
import Nested from './Nested.svelte';

var root = $.from_html(`<!> <meta name="main" content="main"/> <!>`, 1);

export default function Main($$anchor) {
	$.head('xs8ykv', ($$anchor) => {
		var fragment = root();
		var node = $.first_child(fragment);

		$.html(node, () => '<meta name="main_html" content="main_html">');

		var node_1 = $.sibling(node, 4);

		HeadNested(node_1, {});
		$.append($$anchor, fragment);
	});

	Nested($$anchor, {});
}