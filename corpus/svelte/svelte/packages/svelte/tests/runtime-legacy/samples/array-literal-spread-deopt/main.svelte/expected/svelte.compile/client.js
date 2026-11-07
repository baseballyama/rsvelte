import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div> </div>`);

export default function Main($$anchor) {
	const foo = ['a', 'b', 'c'];
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.each(node, 17, () => [...foo], $.index, ($$anchor, item) => {
		var div = root();
		var text = $.only_child(div, true);

		$.template_effect(() => $.set_text(text, $.get(item)));
		$.append($$anchor, div);
	});

	$.append($$anchor, fragment);
}