import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<ol class="numeric-list"><!></ol>`);

export default function NumericList($$anchor, $$props) {
	var ol = root();
	var node = $.child(ol);

	$.slot(node, $$props, 'default', {}, null);
	$.reset(ol);
	$.append($$anchor, ol);
}