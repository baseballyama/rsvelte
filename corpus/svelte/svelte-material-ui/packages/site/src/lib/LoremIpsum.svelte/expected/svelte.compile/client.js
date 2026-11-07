import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
    tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,
    quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
    consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse
    cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat
    non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>`);

export default function LoremIpsum($$anchor) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.each(node, 16, () => Array(2), $.index, ($$anchor, _item) => {
		var p = root();

		$.append($$anchor, p);
	});

	$.append($$anchor, fragment);
}