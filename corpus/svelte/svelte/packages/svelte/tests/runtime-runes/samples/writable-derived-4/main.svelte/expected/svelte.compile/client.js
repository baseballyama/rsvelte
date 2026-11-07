import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button>mutate</button> <button>assign self</button> <button>assign copy</button> <div> </div>`, 1);

export default function Main($$anchor) {
	let count = $.derived(() => ({ value: 1 }));
	var fragment = root();
	var button = $.first_child(fragment);
	var button_1 = $.sibling(button, 2);
	var button_2 = $.sibling(button_1, 2);
	var div = $.sibling(button_2, 2);
	var text = $.only_child(div, true);

	$.template_effect(() => $.set_text(text, $.get(count).value));
	$.delegated('click', button, () => $.get(count).value++);
	$.delegated('click', button_1, () => $.set(count, $.get(count)));
	$.delegated('click', button_2, () => $.set(count, { ...$.get(count) }));
	$.append($$anchor, fragment);
}

$.delegate(['click']);