import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<h1>hello</h1> <button>go to /routing/external-popstate/does-not-exist</button>`, 1);

export default function _page($$anchor) {
	var fragment = root();
	var button = $.sibling($.first_child(fragment), 2);

	$.delegated('click', button, () => {
		history.pushState({}, '', '/routing/external-popstate/does-not-exist');
	});

	$.append($$anchor, fragment);
}

$.delegate(['click']);