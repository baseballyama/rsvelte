import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div> </div>`);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	const arr = [1, 2, 3];
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.each(node, 17, () => arr, (item) => (() => item)(), ($$anchor, item) => {
		var div = root();
		var text = $.only_child(div, true);

		$.template_effect(() => $.set_text(text, $.get(item)));
		$.append($$anchor, div);
	});

	$.append($$anchor, fragment);
	$.pop();
}