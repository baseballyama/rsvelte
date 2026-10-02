import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { untrack } from 'svelte';

var root = $.from_html(`<div> </div>`);
var root_1 = $.from_html(`<!> <!> <!> <p> </p>`, 1);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	const item = ($$anchor, $$arg0) => {
		let id = $.derived_safe_equal(() => $.fallback($$arg0?.(), default_arg, true));
		var div = root();
		var text = $.only_child(div);

		$.template_effect(() => $.set_text(text, `${$.get(id) ?? ''} ${$.get(id) ?? ''} ${$.get(id) ?? ''}`));
		$.append($$anchor, div);
	};

	let count = $.state(0);

	function default_arg() {
		untrack(() => $.update(count));

		return 1;
	}

	var fragment = root_1();
	var node = $.first_child(fragment);

	item(node);

	var node_1 = $.sibling(node, 2);

	item(node_1, () => 2);

	var node_2 = $.sibling(node_1, 2);

	item(node_2);

	var p = $.sibling(node_2, 2);
	var text_1 = $.only_child(p, true);

	$.template_effect(() => $.set_text(text_1, $.get(count)));
	$.append($$anchor, fragment);
	$.pop();
}