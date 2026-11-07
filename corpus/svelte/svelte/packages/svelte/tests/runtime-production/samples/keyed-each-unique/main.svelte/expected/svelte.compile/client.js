import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button>add</button> <!>`, 1);

export default function Main($$anchor) {
	let data = $.state($.proxy([1, 2, 3, 4, 5]));
	var fragment = root();
	var button = $.first_child(fragment);
	var node = $.sibling(button, 2);

	$.each(node, 16, () => $.get(data), (d) => d, ($$anchor, d) => {
		$.next();

		var text = $.text();

		$.template_effect(() => $.set_text(text, d));
		$.append($$anchor, text);
	});

	$.delegated('click', button, () => $.set(data, [1, 1, 3, 1], true));
	$.append($$anchor, fragment);
}

$.delegate(['click']);