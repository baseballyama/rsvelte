import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Child from './Child.svelte';

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	let items = [1];

	function add() {
		items = [1];
	}

	function remove() {
		items = [];
	}

	var $$exports = { add, remove };
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.each(node, 17, () => items, $.index, ($$anchor, item) => {
		Child($$anchor, {});
	});

	$.append($$anchor, fragment);

	return $.pop($$exports);
}