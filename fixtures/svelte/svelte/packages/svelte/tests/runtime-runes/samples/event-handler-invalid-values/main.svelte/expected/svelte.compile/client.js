import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button>click</button> <button>click</button> <button>click</button>`, 1);

export default function Main($$anchor) {
	let ignore = null;
	let handler = () => console.log("clicked");
	let bad = "invalid";
	var fragment = root();
	var button = $.first_child(fragment);
	var button_1 = $.sibling(button, 2);
	var button_2 = $.sibling(button_1, 2);

	$.delegated('click', button, ignore);
	$.delegated('click', button_1, handler);
	$.delegated('click', button_2, bad);
	$.append($$anchor, fragment);
}

$.delegate(['click']);