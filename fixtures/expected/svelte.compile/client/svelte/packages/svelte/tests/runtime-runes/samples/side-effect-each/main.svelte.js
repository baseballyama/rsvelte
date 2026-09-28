import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p> </p>`);
var root_1 = $.from_html(`<button>Add</button> <!>`, 1);

export default function Main($$anchor) {
	let items = $.proxy([]);
	var fragment = root_1();
	var button = $.first_child(fragment);
	var node = $.sibling(button, 2);

	$.each(node, 16, () => items.sort(), (item) => item, ($$anchor, item) => {
		var p = root();
		var text = $.only_child(p, true);

		$.template_effect(() => $.set_text(text, item));
		$.append($$anchor, p);
	});

	$.delegated('click', button, () => items.push(3, 2, 1));
	$.append($$anchor, fragment);
}

$.delegate(['click']);