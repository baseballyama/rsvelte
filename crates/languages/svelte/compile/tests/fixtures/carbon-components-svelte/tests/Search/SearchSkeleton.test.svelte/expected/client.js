import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Search from "carbon-components-svelte/Search/Search.svelte";
import SearchSkeleton from "carbon-components-svelte/Search/SearchSkeleton.svelte";

var root = $.from_html(`<!> <!> <!> <!>`, 1);

export default function SearchSkeleton_test($$anchor) {
	var fragment = root();
	var node = $.first_child(fragment);

	Search(node, { skeleton: true, labelText: 'Default skeleton' });

	var node_1 = $.sibling(node, 2);

	Search(node_1, { size: 'lg', skeleton: true, labelText: 'Large skeleton' });

	var node_2 = $.sibling(node_1, 2);

	Search(node_2, { size: 'sm', skeleton: true, labelText: 'Small skeleton' });

	var node_3 = $.sibling(node_2, 2);

	SearchSkeleton(node_3, { hideLabel: true, 'data-testid': 'skeleton-hide-label' });
	$.append($$anchor, fragment);
}