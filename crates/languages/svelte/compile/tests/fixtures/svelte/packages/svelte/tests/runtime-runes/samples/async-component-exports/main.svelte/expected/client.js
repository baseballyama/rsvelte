import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Child from './Child.svelte';

var root = $.from_html(`<!> <button>log</button>`, 1);

export default function Main($$anchor) {
	let child;
	var fragment = root();
	var node = $.first_child(fragment);

	$.bind_this(Child(node, {}), ($$value) => child = $$value, () => child);

	var button = $.sibling(node, 2);

	$.delegated('click', button, () => {
		child.foo();
		child.bar();
	});

	$.append($$anchor, fragment);
}

$.delegate(['click']);