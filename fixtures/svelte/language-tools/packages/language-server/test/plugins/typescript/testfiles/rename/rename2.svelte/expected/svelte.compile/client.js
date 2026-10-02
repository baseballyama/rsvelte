import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Rename from './rename.svelte';
import Rename3 from './rename3.svelte';

var root = $.from_html(`<!> <!> <div class="foo"></div>`, 1);

export default function Rename2($$anchor) {
	var fragment = root();
	var node = $.first_child(fragment);

	Rename(node, { exportedProp: 2 });

	var node_1 = $.sibling(node, 2);

	Rename3(node_1, { exportedPropFromJs: 2 });
	$.next(2);
	$.append($$anchor, fragment);
}