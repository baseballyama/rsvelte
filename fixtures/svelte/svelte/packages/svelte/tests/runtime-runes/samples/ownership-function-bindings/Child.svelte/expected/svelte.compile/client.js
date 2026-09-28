import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button></button>`);

export default function Child($$anchor, $$props) {
	$.push($$props, true);

	var button = root();

	$.delegated('click', button, () => $$props.arr.push($$props.arr.length));
	$.append($$anchor, button);
	$.pop();
}

$.delegate(['click']);