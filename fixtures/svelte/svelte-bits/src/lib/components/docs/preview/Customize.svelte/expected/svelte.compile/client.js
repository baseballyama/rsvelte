import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<h2 class="demo-title-extra">Customize</h2> <div class="preview-options"><!></div>`, 1);

export default function Customize($$anchor, $$props) {
	var fragment = root();
	var div = $.sibling($.first_child(fragment), 2);
	var node = $.child(div);

	$.snippet(node, () => $$props.children);
	$.reset(div);
	$.append($$anchor, fragment);
}