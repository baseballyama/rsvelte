import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { TextPlaceholder } from "flowbite-svelte";

var root = $.from_html(`<!> <!> <!> <!> <!>`, 1);

export default function Text($$anchor) {
	var fragment = root();
	var node = $.first_child(fragment);

	TextPlaceholder(node, {});

	var node_1 = $.sibling(node, 2);

	TextPlaceholder(node_1, { size: 'md', class: 'mt-8' });

	var node_2 = $.sibling(node_1, 2);

	TextPlaceholder(node_2, { size: 'lg', class: 'mt-8' });

	var node_3 = $.sibling(node_2, 2);

	TextPlaceholder(node_3, { size: 'xl', class: 'mt-8' });

	var node_4 = $.sibling(node_3, 2);

	TextPlaceholder(node_4, { size: '2xl', class: 'mt-8' });
	$.append($$anchor, fragment);
}