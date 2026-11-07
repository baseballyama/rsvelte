import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { untrack } from 'svelte';

var root = $.from_html(`<button>linked.current</button> <button>count</button> `, 1);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	let count = $.state(0);
	let state = $.proxy({ current: $.get(count) });

	let linked = $.derived(() => {
		$.get(count);
		untrack(() => state.current = $.get(count));

		return untrack(() => state);
	});

	$.get(linked).current++;

	var fragment = root();
	var button = $.first_child(fragment);
	var text = $.sibling(button);
	var button_1 = $.sibling(text);
	var text_1 = $.sibling(button_1);

	$.template_effect(() => {
		$.set_text(text, ` ${$.get(linked).current ?? ''} `);
		$.set_text(text_1, ` ${$.get(count) ?? ''}`);
	});

	$.delegated('click', button, () => $.get(linked).current++);
	$.delegated('click', button_1, () => $.update(count));
	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);