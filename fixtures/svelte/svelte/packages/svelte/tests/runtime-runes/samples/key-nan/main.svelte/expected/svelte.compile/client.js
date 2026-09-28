import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(` <p>it rendered</p>`, 1);
var root_1 = $.from_html(`<button>update</button> <!>`, 1);

export default function Main($$anchor) {
	let x = $.state($.proxy(NaN));
	var fragment = root_1();
	var button = $.first_child(fragment);
	var node = $.sibling(button, 2);

	$.key(node, () => $.get(x), ($$anchor) => {
		var fragment_1 = root();
		var text = $.first_child(fragment_1);

		text.nodeValue = `${console.log('rendering') ?? ''} `;
		$.next();
		$.append($$anchor, fragment_1);
	});

	$.delegated('click', button, () => $.set(x, NaN, true));
	$.append($$anchor, fragment);
}

$.delegate(['click']);