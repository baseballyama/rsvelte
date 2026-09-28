import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Stale from '../Stale.svelte';

var root = $.from_html(`<button data-testid="toggle">toggle</button> <!> <a href="/snapshot/stale/a">a</a>`, 1);

export default function _page($$anchor) {
	let shown = $.state(false);
	var fragment = root();
	var button = $.first_child(fragment);
	var node = $.sibling(button, 2);

	{
		var consequent = ($$anchor) => {
			Stale($$anchor, {});
		};

		$.if(node, ($$render) => {
			if ($.get(shown)) $$render(consequent);
		});
	}

	$.next(2);
	$.delegated('click', button, () => $.set(shown, !$.get(shown)));
	$.append($$anchor, fragment);
}

$.delegate(['click']);