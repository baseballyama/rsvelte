import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { untrack } from 'svelte';

var root = $.from_html(`<div> </div>`);
var root_1 = $.from_html(`<!> <p> </p>`, 1);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	let count = $.state(0);

	function default_arg() {
		untrack(() => $.update(count));

		return 1;
	}

	var fragment = root_1();
	var node = $.first_child(fragment);

	$.each(node, 16, () => [{}, { a: 2 }, {}], $.index, ($$anchor, $$item) => {
		let a = $.derived_safe_equal(() => $.fallback($$item.a, default_arg, true));
		var div = root();
		var text = $.only_child(div);

		$.template_effect(() => $.set_text(text, `${$.get(a) ?? ''} ${$.get(a) ?? ''} ${$.get(a) ?? ''}`));
		$.append($$anchor, div);
	});

	var p = $.sibling(node, 2);
	var text_1 = $.only_child(p, true);

	$.template_effect(() => $.set_text(text_1, $.get(count)));
	$.append($$anchor, fragment);
	$.pop();
}