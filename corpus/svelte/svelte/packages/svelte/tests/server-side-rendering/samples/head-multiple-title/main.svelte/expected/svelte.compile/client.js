import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import A from './A.svelte';
import B from './B.svelte';

var root = $.from_html(`<!> <!>`, 1);

export default function Main($$anchor) {
	var fragment = root();

	$.head('1ivchbz', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Main';
		});
	});

	var node = $.first_child(fragment);

	A(node, {});

	var node_1 = $.sibling(node, 2);

	B(node_1, {});
	$.append($$anchor, fragment);
}