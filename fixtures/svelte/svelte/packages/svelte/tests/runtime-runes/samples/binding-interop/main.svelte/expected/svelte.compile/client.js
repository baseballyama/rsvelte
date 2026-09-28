import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Legacy from './Legacy.svelte';
import Runes from './Runes.svelte';

var root = $.from_html(`<!> <hr/> <!>`, 1);

export default function Main($$anchor) {
	var fragment = root();
	var node = $.first_child(fragment);

	Legacy(node, {});

	var node_1 = $.sibling(node, 4);

	Runes(node_1, {});
	$.append($$anchor, fragment);
}