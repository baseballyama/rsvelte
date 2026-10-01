import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p> </p>`);

export default function Each_ts($$anchor, $$props) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.each(node, 16, () => $$props.items, (item) => item, ($$anchor, item) => {
		var p = root();
		var text = $.only_child(p, true);

		$.template_effect(() => $.set_text(text, item));
		$.append($$anchor, p);
	});

	$.append($$anchor, fragment);
}