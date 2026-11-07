import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Child from './Child.svelte';

var root = $.from_html(`<button>update</button> <!>`, 1);

export default function Main($$anchor) {
	let message = $.state('one');

	function attachment(message) {
		return (node) => {
			node.textContent = message;
		};
	}

	var fragment = root();
	var button = $.first_child(fragment);
	var node_1 = $.sibling(button, 2);

	Child(node_1, {
		[$.attachment()]: ($$node) => (attachment($.get(message)) || $.noop)($$node)
	});

	$.delegated('click', button, () => $.set(message, 'two'));
	$.append($$anchor, fragment);
}

$.delegate(['click']);