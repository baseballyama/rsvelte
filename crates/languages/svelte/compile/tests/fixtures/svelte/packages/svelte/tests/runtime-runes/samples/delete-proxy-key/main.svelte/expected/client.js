import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p> </p>`);
var root_1 = $.from_html(`<button>delete</button> <!>`, 1);

export default function Main($$anchor) {
	let obj = $.proxy({ test: 0 });
	let keys = $.derived(() => Object.keys(obj));
	var fragment = root_1();
	var button = $.first_child(fragment);
	var node = $.sibling(button, 2);

	$.each(node, 17, () => $.get(keys), $.index, ($$anchor, key) => {
		var p = root();
		var text = $.only_child(p, true);

		$.template_effect(() => $.set_text(text, $.get(key)));
		$.append($$anchor, p);
	});

	$.delegated('click', button, () => delete obj.test);
	$.append($$anchor, fragment);
}

$.delegate(['click']);