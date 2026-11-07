import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Component1 from './Component1.svelte';
import Component2 from './Component2.svelte';
import Component3 from './Component3.svelte';
import Component4 from './Component4.svelte';

var root = $.from_html(`<!> <!> <!> <!>`, 1);

export default function Main($$anchor) {
	var fragment = root();
	var node = $.first_child(fragment);

	Component1(node, {});

	var node_1 = $.sibling(node, 2);

	Component2(node_1, {});

	var node_2 = $.sibling(node_1, 2);

	Component3(node_2, {});

	var node_3 = $.sibling(node_2, 2);

	Component4(node_3, {});
	$.append($$anchor, fragment);
}