import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button></button> <button></button>`, 1);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	var fragment = root();
	var button = $.first_child(fragment);
	var button_1 = $.sibling(button, 2);

	$.event('click', button, () => {
		this.x = 1;
	});

	$.event('click', button_1, function () {
		this.x = 1;
	});

	$.append($$anchor, fragment);
	$.pop();
}