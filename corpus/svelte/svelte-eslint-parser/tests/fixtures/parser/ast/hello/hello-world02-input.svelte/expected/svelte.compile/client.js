import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Nested from './Nested.svelte';

var root = $.from_html(`<p class="svelte-oa79xh">These styles...</p> <!>`, 1);

export default function Hello_world02_input($$anchor) {
	var fragment = root();
	var node = $.sibling($.first_child(fragment), 2);

	Nested(node, {});
	$.append($$anchor, fragment);
}