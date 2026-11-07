import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { SvelteSet } from 'svelte/reactivity';
import Child from './Child.svelte';

var root = $.from_html(`<button>+1</button> <!>`, 1);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	const numbers = new SvelteSet([0, 1, 2]);
	var fragment = root();
	var button = $.first_child(fragment);
	var node = $.sibling(button, 2);

	{
		let $0 = $.derived(() => [...numbers]);

		Child(node, {
			get numbers() {
				return $.get($0);
			}
		});
	}

	$.delegated('click', button, () => numbers.add(numbers.size));
	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);