import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Checkbox from './checkbox.svelte';

var root = $.from_html(`<button>Add</button> <!>`, 1);

export default function Main($$anchor) {
	let foo = $.proxy({});
	const schema = $.proxy({ foo: true });

	function retrieveSchema() {
		const cloned = { ...schema };

		for (const key of Object.keys(foo)) {
			cloned[key] = key;
		}

		return cloned;
	}

	const keys = $.derived(() => Object.keys(retrieveSchema()));
	let nextKey = 1;
	var fragment = root();
	var button = $.first_child(fragment);
	var node = $.sibling(button, 2);

	$.each(node, 16, () => $.get(keys), (key) => key, ($$anchor, key) => {
		Checkbox($$anchor, {
			get value() {
				return foo[key];
			},

			set value($$value) {
				foo[key] = $$value;
			}
		});
	});

	$.delegated('click', button, () => {
		foo[nextKey++] = true;
	});

	$.append($$anchor, fragment);
}

$.delegate(['click']);