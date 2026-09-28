import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p> </p>`);

export default function Main($$anchor) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.each(node, 16, () => ['a', 'b', 'c'], $.index, ($$anchor, letter) => {
		var p = root();
		var text = $.only_child(p, true);

		$.template_effect(() => $.set_text(text, letter));
		$.append($$anchor, p);
	});

	$.append($$anchor, fragment);
}