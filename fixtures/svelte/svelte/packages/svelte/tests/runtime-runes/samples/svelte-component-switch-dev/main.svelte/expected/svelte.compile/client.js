import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import A from './A.svelte';
import B from './B.svelte';

var root = $.from_html(`<button>switch</button> <!>`, 1);

export default function Main($$anchor) {
	let component = $.state($.proxy(A));
	var fragment = root();
	var button = $.first_child(fragment);
	var node = $.sibling(button, 2);

	$.component(node, () => $.get(component), ($$anchor, $$component) => {
		$$component($$anchor, {});
	});

	$.delegated('click', button, () => $.set(component, B, true));
	$.append($$anchor, fragment);
}

$.delegate(['click']);