import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Child from './rename3.svelte';

var root = $.from_html(`<main><!> <!></main>`);

export default function Rename4($$anchor) {
	let componentRef;
	var main = root();
	var node = $.child(main);

	$.bind_this(Child(node, {}), ($$value) => componentRef = $$value, () => componentRef);

	var node_1 = $.sibling(node, 2);

	Child(node_1, {});
	$.reset(main);
	$.append($$anchor, main);
}