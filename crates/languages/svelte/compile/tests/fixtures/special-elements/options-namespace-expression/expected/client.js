import 'svelte/internal/disclose-version';

import * as $ from 'svelte/internal/client';

var root = $.from_svg(`<circle r="5"></circle>`);

export default function Options_namespace_expression($$anchor) {
	var circle = root();
	$.append($$anchor, circle);
}
