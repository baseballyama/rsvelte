import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Search from "carbon-components-svelte/Search/Search.svelte";
import SearchMenuSkeleton from "carbon-components-svelte/SearchMenu/SearchMenuSkeleton.svelte";

var root = $.from_html(`<div class="bx--search-menu"><div class="bx--search-menu__search"><!> <!></div></div>`);

export default function SearchMenuSkeleton_test($$anchor) {
	var div = root();
	var div_1 = $.child(div);
	var node = $.child(div_1);

	Search(node, { skeleton: true, labelText: 'Search' });

	var node_1 = $.sibling(node, 2);

	SearchMenuSkeleton(node_1, { count: 3 });
	$.reset(div_1);
	$.reset(div);
	$.append($$anchor, div);
}