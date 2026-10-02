import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<!> <!>`, 1);

export default function Codeaction_custom_fix_all_component3($$anchor) {
	var fragment = root();
	var node = $.first_child(fragment);

	FixAllImported2(node, {});

	var node_1 = $.sibling(node, 2);

	FixAllImported3(node_1, {});
	$.append($$anchor, fragment);
}