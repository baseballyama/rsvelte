import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<h1>b</h1> <button>go back</button>`, 1);

export default function _page($$anchor) {
	var fragment = root();
	var button = $.sibling($.first_child(fragment), 2);

	$.delegated('click', button, () => history.back());
	$.append($$anchor, fragment);
}

$.delegate(['click']);