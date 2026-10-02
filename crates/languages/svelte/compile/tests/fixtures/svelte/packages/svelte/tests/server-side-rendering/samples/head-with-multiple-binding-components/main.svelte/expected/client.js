import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Wrapper from './Wrapper.svelte';

var root = $.from_html(`<link rel="canonical" href="/test"/> <meta name="description" content="test"/>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);

export default function Main($$anchor) {
	var fragment_1 = root_1();

	$.head('1xpjprw', ($$anchor) => {
		var fragment = root();

		$.next(2);
		$.append($$anchor, fragment);
	});

	var node = $.first_child(fragment_1);

	Wrapper(node, {});

	var node_1 = $.sibling(node, 2);

	Wrapper(node_1, {});

	var node_2 = $.sibling(node_1, 2);

	Wrapper(node_2, {});
	$.append($$anchor, fragment_1);
}