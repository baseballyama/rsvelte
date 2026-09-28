import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<!> <hr/> <!> <hr/> <!> <hr/> <!> <hr/> <!> <hr/> <!> <hr/> <!> <hr/> <!> <hr/> <!>`, 1);

export default function Child($$anchor, $$props) {
	$.push($$props, true);

	function getOptional() {
		return $$props.optional;
	}

	var fragment = root();
	var node = $.first_child(fragment);

	$.snippet(node, () => $$props.snippets[$$props.snippet]);

	var node_1 = $.sibling(node, 4);

	$.snippet(node_1, () => $$props.snippets?.[$$props.snippet] ?? $.noop);

	var node_2 = $.sibling(node_1, 4);

	$.snippet(node_2, () => $$props.snippets.foo);

	var node_3 = $.sibling(node_2, 4);

	$.snippet(node_3, () => $$props.snippets?.foo ?? $.noop);

	var node_4 = $.sibling(node_3, 4);

	$.snippet(node_4, () => $$props.snippets?.foo ?? $.noop);

	var node_5 = $.sibling(node_4, 4);

	$.snippet(node_5, () => $$props.snippets.foo ?? $.noop);

	var node_6 = $.sibling(node_5, 4);

	$.snippet(node_6, () => $$props.optional ?? $$props.snippets.bar);

	var node_7 = $.sibling(node_6, 4);

	$.snippet(node_7, () => $$props.optional ?? $.noop);

	var node_8 = $.sibling(node_7, 4);

	$.snippet(node_8, () => getOptional() ?? $.noop);
	$.append($$anchor, fragment);
	$.pop();
}