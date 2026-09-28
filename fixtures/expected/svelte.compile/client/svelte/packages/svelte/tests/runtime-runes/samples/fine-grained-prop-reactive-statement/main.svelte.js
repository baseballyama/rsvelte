import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Old from './old.svelte';

var root = $.from_html(`<button>reassign</button> <button>mutate</button> <!>`, 1);

export default function Main($$anchor) {
	let prop = $.state($.proxy({ count: 0 }));
	var fragment = root();
	var button = $.first_child(fragment);
	var button_1 = $.sibling(button, 2);
	var node = $.sibling(button_1, 2);

	Old(node, {
		get prop() {
			return $.get(prop);
		}
	});

	$.delegated('click', button, () => $.set(prop, { ...$.get(prop), count: $.get(prop).count + 1 }, true));
	$.delegated('click', button_1, () => $.get(prop).count++);
	$.append($$anchor, fragment);
}

$.delegate(['click']);