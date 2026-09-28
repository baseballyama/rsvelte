import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p> </p>`);
var root_1 = $.from_html(`<button>click me</button> <!>`, 1);

export default function Main($$anchor) {
	let list = [1, 2, 3];
	var fragment = root_1();
	var button = $.first_child(fragment);
	var node = $.sibling(button, 2);

	$.each(node, 17, () => list, $.index, ($$anchor, number) => {
		var p = root();
		var text = $.only_child(p, true);

		$.template_effect(() => $.set_text(text, $.get(number)));
		$.append($$anchor, p);
	});

	$.event('click', button, (event) => {
		list = list.map((item) => {
			return item * 2;
		});
	});

	$.append($$anchor, fragment);
}