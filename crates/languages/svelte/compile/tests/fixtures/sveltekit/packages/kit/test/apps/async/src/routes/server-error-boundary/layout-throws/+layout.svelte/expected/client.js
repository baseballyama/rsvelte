import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div id="throwing-layout"><!></div>`);

export default function _layout($$anchor, $$props) {
	$.push($$props, true);

	throw new Error('layout render error');

	var div = root();
	var node = $.child(div);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}