import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button>undef</button> <button>null</button> <button>invalid</button>`, 1);

export default function Main($$anchor) {
	let handlerUndef;
	let handlerNull;
	let handlerInvalid;

	handlerUndef = undefined;
	handlerNull = null;
	handlerInvalid = 42;

	var fragment = root();
	var button = $.first_child(fragment);
	var button_1 = $.sibling(button, 2);
	var button_2 = $.sibling(button_1, 2);

	$.event('click', button, handlerUndef);
	$.event('click', button_1, handlerNull);
	$.event('click', button_2, handlerInvalid);
	$.append($$anchor, fragment);
}