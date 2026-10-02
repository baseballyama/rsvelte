import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Level3 from './Level3.svelte';

var root = $.from_html(`<span>level 2</span> <!>`, 1);

export default function Level2($$anchor, $$props) {
	var fragment = root();
	var node = $.sibling($.first_child(fragment), 2);

	$.slot(node, $$props, 'default', {}, null);
	$.append($$anchor, fragment);
}