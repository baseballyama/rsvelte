import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Component from './Component.svelte';

var root = $.from_html(`<!> <button>set null</button> <button>set object</button>`, 1);

export default function Main($$anchor) {
	let items = $.proxy(['hello', 'world', 'bye']);
	var fragment = root();
	var node = $.first_child(fragment);

	$.each(node, 17, () => items, $.index, ($$anchor, item) => {
		Component($$anchor, {
			get item() {
				return $.get(item);
			}
		});
	});

	var button = $.sibling(node, 2);
	var button_1 = $.sibling(button, 2);

	$.delegated('click', button, () => items[1] = null);
	$.delegated('click', button_1, () => items[1] = 'hello');
	$.append($$anchor, fragment);
}

$.delegate(['click']);