import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import FixAllImported from './importing/FixAllImported.svelte';
import FixAllImported2 from './importing/FixAllImported2.svelte';

var root = $.from_html(`<!> <!>`, 1);

export default function Codeaction_custom_fix_all_component6($$anchor) {
	var fragment = root();
	var node = $.first_child(fragment);

	FixAllImported(node, {});

	var node_1 = $.sibling(node, 2);

	FixAllImported2(node_1, {});
	$.append($$anchor, fragment);
}