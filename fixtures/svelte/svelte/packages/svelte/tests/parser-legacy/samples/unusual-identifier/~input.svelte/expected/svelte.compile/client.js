import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p> </p>`);

export default function Input($$anchor) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.each(node, 16, () => things, $.index, ($$anchor, 𐊧) => {
		var p = root();
		var text = $.only_child(p, true);

		$.template_effect(() => $.set_text(text, 𐊧));
		$.append($$anchor, p);
	});

	$.append($$anchor, fragment);
}