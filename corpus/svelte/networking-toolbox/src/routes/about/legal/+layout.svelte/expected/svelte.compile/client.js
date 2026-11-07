import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import '../../../styles/pages.scss';

var root = $.from_html(`<div class="legal-page svelte-ljn3jp"><!></div>`);

export default function _layout($$anchor, $$props) {
	var div = root();
	var node = $.child(div);

	$.slot(node, $$props, 'default', {}, null);
	$.reset(div);
	$.append($$anchor, div);
}