import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div>before</div> <br/> <!> <div>after</div>`, 1);

export default function Main($$anchor) {
	let content = ["a ", "b ", "c "];
	var fragment = root();
	var node = $.sibling($.first_child(fragment), 4);

	$.each(node, 17, () => content, $.index, ($$anchor, c) => {
		var fragment_1 = $.comment();
		var node_1 = $.first_child(fragment_1);

		$.html(node_1, () => $.get(c));
		$.append($$anchor, fragment_1);
	});

	$.next(2);
	$.append($$anchor, fragment);
}