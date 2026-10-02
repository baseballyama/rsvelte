import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div id="nested-layout"><h2>Nested Layout</h2> <!></div>`);

export default function _layout($$anchor, $$props) {
	var div = root();
	var node = $.sibling($.child(div), 2);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.reset(div);
	$.append($$anchor, div);
}