import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { ImagePlaceholder } from "flowbite-svelte";

var root = $.from_html(`<!> <!> <!> <!>`, 1);

export default function Image($$anchor) {
	var fragment = root();
	var node = $.first_child(fragment);

	ImagePlaceholder(node, { size: 'sm' });

	var node_1 = $.sibling(node, 2);

	ImagePlaceholder(node_1, { imgOnly: true });

	var node_2 = $.sibling(node_1, 2);

	ImagePlaceholder(node_2, { size: 'md' });

	var node_3 = $.sibling(node_2, 2);

	ImagePlaceholder(node_3, { size: 'lg' });
	$.append($$anchor, fragment);
}