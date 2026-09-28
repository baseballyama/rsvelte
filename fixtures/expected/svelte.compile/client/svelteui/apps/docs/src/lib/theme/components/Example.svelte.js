import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div class="example"><div class="result"><!></div> <div class="code"><!></div></div>`);

export default function Example($$anchor, $$props) {
	var div = root();
	var div_1 = $.child(div);
	var node = $.child(div_1);

	$.slot(node, $$props, 'result', {}, null);
	$.reset(div_1);

	var div_2 = $.sibling(div_1, 2);
	var node_1 = $.child(div_2);

	$.slot(node_1, $$props, 'code', {}, null);
	$.reset(div_2);
	$.reset(div);
	$.append($$anchor, div);
}