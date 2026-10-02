import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p> </p>`);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function _3_snippet_scope_input($$anchor, $$props) {
	const hello = ($$anchor, name = $.noop) => {
		var p = root();
		var text = $.only_child(p);

		$.template_effect(() => $.set_text(text, `hello ${name() ?? ''}! ${message() ?? ''}!`));
		$.append($$anchor, p);
	};

	let message = $.prop($$props, 'message', 19, () => `it's great to see you!`);
	var fragment = root_1();
	var node = $.first_child(fragment);

	hello(node, () => 'alice');

	var node_1 = $.sibling(node, 2);

	hello(node_1, () => 'bob');
	$.append($$anchor, fragment);
}