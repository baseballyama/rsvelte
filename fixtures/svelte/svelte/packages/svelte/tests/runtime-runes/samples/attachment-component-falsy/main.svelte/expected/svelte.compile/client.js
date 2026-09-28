import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Child from './Child.svelte';

var root = $.from_html(`<button></button> <!>`, 1);

export default function Main($$anchor) {
	function attachment() {
		console.log("up");
	}

	let enabled = $.state(false);
	var fragment = root();
	var button = $.first_child(fragment);
	var node = $.sibling(button, 2);

	Child(node, {
		[$.attachment()]: ($$node) => ($.get(enabled) && attachment || $.noop)($$node)
	});

	$.delegated('click', button, () => $.set(enabled, !$.get(enabled)));
	$.append($$anchor, fragment);
}

$.delegate(['click']);