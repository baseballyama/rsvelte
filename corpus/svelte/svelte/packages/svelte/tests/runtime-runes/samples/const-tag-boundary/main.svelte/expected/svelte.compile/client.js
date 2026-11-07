import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p> </p>`);
var root_1 = $.from_html(`<button>increment</button> <!>`, 1);

export default function Main($$anchor) {
	let count = $.state(1);
	var fragment = root_1();
	var button = $.first_child(fragment);
	var node = $.sibling(button, 2);

	$.boundary(node, {}, ($$anchor) => {
		const double = $.derived(() => $.get(count) * 2);
		var p = root();
		var text = $.only_child(p, true);

		$.template_effect(() => $.set_text(text, $.get(double)));
		$.append($$anchor, p);
	});

	$.delegated('click', button, () => $.update(count));
	$.append($$anchor, fragment);
}

$.delegate(['click']);