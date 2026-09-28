import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { browser } from "$app/environment";
import Search from "$lib/search/Search.svelte";
import SearchBox from "$lib/search/SearchBox.svelte";

var root = $.from_html(`<!> <!>`, 1);

export default function _page($$anchor) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var fragment_1 = root();
			var node_1 = $.first_child(fragment_1);

			Search(node_1, {});

			var node_2 = $.sibling(node_1, 2);

			SearchBox(node_2, {});
			$.append($$anchor, fragment_1);
		};

		$.if(node, ($$render) => {
			if (browser) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
}