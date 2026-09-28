import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p> </p>`);

export default function Main($$anchor) {
	const foo = [{ in: 'bar' }];
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.each(node, 17, () => foo, $.index, ($$anchor, $$item) => {
		let bar = () => $.get($$item).in;
		var p = root();
		var text = $.only_child(p, true);

		$.template_effect(() => $.set_text(text, bar()));
		$.append($$anchor, p);
	});

	$.append($$anchor, fragment);
}