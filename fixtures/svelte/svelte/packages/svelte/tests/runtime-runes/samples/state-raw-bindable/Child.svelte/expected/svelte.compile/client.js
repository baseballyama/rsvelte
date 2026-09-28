import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button>reassign</button> <button>mutate</button>`, 1);

export default function Child($$anchor, $$props) {
	$.push($$props, true);

	let object = $.prop($$props, 'object', 15);
	var fragment = root();
	var button = $.first_child(fragment);
	var button_1 = $.sibling(button, 2);

	$.delegated('click', button, () => object({ count: object().count + 1 }));
	$.delegated('click', button_1, () => object(object().count += 1, true));
	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);