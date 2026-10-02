import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import ImportTs from '../props_to-import-ts.svelte';
import ImportJs from '../props_to-import-js.svelte';

var root = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!>`, 1);

export default function Input($$anchor) {
	var fragment = root();
	var node = $.first_child(fragment);

	ImportTs(node, {});

	var node_1 = $.sibling(node, 2);

	ImportTs(node_1, { required: undefined });

	var node_2 = $.sibling(node_1, 2);

	ImportTs(node_2, {
		required: 'a',
		optional1: 'b',
		optional2: 'c',
		doesntExist: true
	});

	var node_3 = $.sibling(node_2, 2);

	ImportTs(node_3, { required: true, optional1: true, optional2: true });

	var node_4 = $.sibling(node_3, 2);

	ImportJs(node_4, {});

	var node_5 = $.sibling(node_4, 2);

	ImportJs(node_5, { required: undefined });

	var node_6 = $.sibling(node_5, 2);

	ImportJs(node_6, { required: true, optional1: true, optional2: true });

	var node_7 = $.sibling(node_6, 2);

	ImportTs(node_7, { required: 'a' });

	var node_8 = $.sibling(node_7, 2);

	ImportTs(node_8, { required: 'a', optional1: 'b', optional2: 'c' });

	var node_9 = $.sibling(node_8, 2);

	ImportTs(node_9, { required: 'a', optional1: 'b', optional2: undefined });

	var node_10 = $.sibling(node_9, 2);

	ImportJs(node_10, { required: 'a' });

	var node_11 = $.sibling(node_10, 2);

	ImportJs(node_11, { required: 'a', optional1: 'b', optional2: 'c' });

	var node_12 = $.sibling(node_11, 2);

	ImportJs(node_12, { required: 'a', optional1: 'b', optional2: undefined });
	$.append($$anchor, fragment);
}