import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div class="level3"><h4>level 3</h4> <!></div>`);

export default function Level3($$anchor, $$props) {
	var div = root();
	var node = $.sibling($.child(div), 2);

	$.slot(node, $$props, 'default', {}, null);
	$.reset(div);
	$.append($$anchor, div);
}