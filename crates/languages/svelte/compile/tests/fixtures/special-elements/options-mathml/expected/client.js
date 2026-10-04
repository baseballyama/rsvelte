import 'svelte/internal/disclose-version';

import * as $ from 'svelte/internal/client';

var root = $.from_mathml(`<mi>x</mi><!>`, 1);

export default function Options_mathml($$anchor) {
	var fragment = root();
	var node = $.sibling($.first_child(fragment));
	$.element(node, () => 'mi', true);
	$.append($$anchor, fragment);
}
