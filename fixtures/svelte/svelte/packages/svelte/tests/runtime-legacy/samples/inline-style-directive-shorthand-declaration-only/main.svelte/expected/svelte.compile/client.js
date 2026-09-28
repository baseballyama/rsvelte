import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p></p>`);
var root_1 = $.from_html(`<p></p> <!> <button></button>`, 1);

export default function Main($$anchor) {
	let color = "red";

	function change() {
		color = "green";
	}

	var fragment = root_1();
	var p = $.first_child(fragment);

	$.set_style(p, '', {}, { color });

	var node = $.sibling(p, 2);

	$.each(node, 16, () => [1], $.index, ($$anchor, _) => {
		var p_1 = root();

		$.set_style(p_1, '', {}, { color });
		$.append($$anchor, p_1);
	});

	var button = $.sibling(node, 2);

	$.event('click', button, change);
	$.append($$anchor, fragment);
}