import 'svelte/internal/disclose-version';

import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div>  hello   world  </div>`);

export default function Options_whitespace($$anchor) {
	var div = root();
	$.append($$anchor, div);
}
