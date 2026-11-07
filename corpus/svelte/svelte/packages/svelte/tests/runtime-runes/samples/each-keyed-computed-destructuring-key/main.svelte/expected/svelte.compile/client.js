import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Child from './Child.svelte';

var root = $.from_html(`<button>reverse</button> <!>`, 1);

export default function Main($$anchor) {
	let options = $.proxy([{ a: 1, v: 'a1' }, { a: 2, v: 'a2' }, { a: 3, v: 'a3' }]);
	var fragment = root();
	var button = $.first_child(fragment);
	var node = $.sibling(button, 2);

	Child(node, {
		get options() {
			return options;
		},
		labelKey: 'a',
		valueKey: 'v'
	});

	$.delegated('click', button, () => options.reverse());
	$.append($$anchor, fragment);
}

$.delegate(['click']);