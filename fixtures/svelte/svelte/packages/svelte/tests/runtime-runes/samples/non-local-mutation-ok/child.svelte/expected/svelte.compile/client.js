import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button>mutate</button>`);

export default function Child($$anchor, $$props) {
	$.push($$props, true);

	let klass = $.prop($$props, 'klass', 7),
		getter_setter = $.prop($$props, 'getter_setter', 7);

	var button = root();

	$.delegated('click', button, () => {
		klass().y = 2;
		getter_setter().y = 2;
	});

	$.append($$anchor, button);
	$.pop();
}

$.delegate(['click']);