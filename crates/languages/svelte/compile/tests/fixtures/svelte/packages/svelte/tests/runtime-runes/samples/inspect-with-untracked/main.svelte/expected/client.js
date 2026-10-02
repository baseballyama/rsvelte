import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button></button> <button></button>`, 1);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	let a = $.state(0);
	let b = $.state(0);

	;;

	var fragment = root();
	var button = $.first_child(fragment);
	var button_1 = $.sibling(button, 2);

	$.delegated('click', button, () => $.update(a));
	$.delegated('click', button_1, () => $.update(b));
	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);