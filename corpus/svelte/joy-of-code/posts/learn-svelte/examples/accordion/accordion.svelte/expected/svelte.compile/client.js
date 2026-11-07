import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div class="accordion"><!></div>`);

export default function Accordion($$anchor, $$props) {
	var div = root();
	var node = $.child(div);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.reset(div);
	$.append($$anchor, div);
}