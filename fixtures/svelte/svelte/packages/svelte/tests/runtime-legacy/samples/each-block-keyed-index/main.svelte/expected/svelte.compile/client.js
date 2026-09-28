import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div> </div>`);

export default function Main($$anchor) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.each(node, 18, () => ({ length: 2 }), (item, i) => `${i}`, ($$anchor, item, i) => {
		var div = root();
		var text = $.only_child(div, true);

		$.template_effect(() => $.set_text(text, $.get(i)));
		$.append($$anchor, div);
	});

	$.append($$anchor, fragment);
}