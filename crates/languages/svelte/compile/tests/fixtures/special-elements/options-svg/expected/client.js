import 'svelte/internal/disclose-version';

import * as $ from 'svelte/internal/client';

var root = $.from_svg(`<circle cx="10"></circle><!>`, 1);

export default function Options_svg($$anchor) {
	var fragment = root();
	var node = $.sibling($.first_child(fragment));
	$.element(node, () => 'circle', true);
	$.append($$anchor, fragment);
}
