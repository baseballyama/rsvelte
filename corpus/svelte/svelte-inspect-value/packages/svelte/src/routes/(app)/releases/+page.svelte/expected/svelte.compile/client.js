import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Releases from '../../../doclib/typedoc/Releases.md';

var root = $.from_html(`<h1>Releases</h1> <div class="md-types"><!></div>`, 1);

export default function _page($$anchor) {
	var fragment = root();
	var div = $.sibling($.first_child(fragment), 2);
	var node = $.child(div);

	Releases(node, {});
	$.reset(div);
	$.append($$anchor, fragment);
}