import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button>update</button> <!>`, 1);

export default function Main($$anchor) {
	let inner = Symbol();
	let outer = $.state($.proxy({ inner }));
	var fragment = root();
	var button = $.first_child(fragment);
	var node = $.sibling(button, 2);

	$.key(node, () => $.get(outer).inner, ($$anchor) => {
		var text = $.text();

		text.nodeValue = console.log('rendering');
		$.append($$anchor, text);
	});

	$.delegated('click', button, () => $.set(outer, { inner }, true));
	$.append($$anchor, fragment);
}

$.delegate(['click']);