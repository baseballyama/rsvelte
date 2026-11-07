import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(` <button>+</button>`, 1);

export default function Child($$anchor, $$props) {
	$.push($$props, true);

	let count = $.state(0);

	$.user_pre_effect(() => {
		if ($.get(count) > 1) {
			throw new Error('too high');
		}
	});

	$.next();

	var fragment = root();
	var text = $.first_child(fragment);
	var button = $.sibling(text);

	$.template_effect(() => $.set_text(text, `${$.get(count) ?? ''} `));
	$.delegated('click', button, () => $.update(count));
	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);