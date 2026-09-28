import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import AllTypes from '$doclib/examples/AllTypes.svelte';
import Inspect from '$lib/Inspect.svelte';

var root = $.from_html(`<div style="padding: 2em"><!></div> <div style="padding: 2em"><!> <!> <!></div>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	var fragment = root();
	var div = $.first_child(fragment);
	var node = $.child(div);

	AllTypes(node, {
		seeFlashing: true,
		search: 'highlight',
		highlightMatches: true
	});

	$.reset(div);

	var div_1 = $.sibling(div, 2);
	var node_1 = $.child(div_1);

	Inspect(node_1, { values: new Map([['b', 'a']]) });

	var node_2 = $.sibling(node_1, 2);

	Inspect(node_2, { values: new Set(['b', 'a']) });

	var node_3 = $.sibling(node_2, 2);

	Inspect(node_3, { values: new Uint16Array([1, 2, 3]) });
	$.reset(div_1);
	$.append($$anchor, fragment);
	$.pop();
}