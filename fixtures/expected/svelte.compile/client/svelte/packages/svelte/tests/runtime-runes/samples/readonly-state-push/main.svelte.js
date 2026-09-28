import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Child from './Child.svelte';

var root = $.from_html(`<button>add</button> <!>`, 1);

export default function Main($$anchor) {
	let array = $.proxy([1, 2, 3, 4]);

	const addNew = () => {
		array.push(0);
	};

	var fragment = root();
	var button = $.first_child(fragment);
	var node = $.sibling(button, 2);

	Child(node, {
		get array() {
			return array;
		}
	});

	$.delegated('click', button, addNew);
	$.append($$anchor, fragment);
}

$.delegate(['click']);