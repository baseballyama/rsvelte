import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p> </p>`);

export default function Child($$anchor, $$props) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.each(node, 17, () => $$props.array, $.index, ($$anchor, number) => {
		var p = root();
		var text = $.only_child(p, true);

		$.template_effect(() => $.set_text(text, $.get(number)));
		$.append($$anchor, p);
	});

	$.append($$anchor, fragment);
}