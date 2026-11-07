import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Child from "./Child.svelte";

export default function Main($$anchor) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.boundary(node, { onerror: (e) => console.log('error caught') }, ($$anchor) => {
		Child($$anchor, {});
	});

	$.append($$anchor, fragment);
}