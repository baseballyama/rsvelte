import 'svelte/internal/disclose-version';

import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p> </p>`);

var root_1 = $.from_html(`<p>No results.</p>`);

export default function Each_else($$anchor, $$props) {
	var fragment = $.comment();
	var node = $.first_child(fragment);
	$.each(node, 17, () => $$props.results, $.index, ($$anchor, result) => {
		var p = root();
		var text = $.only_child(p, true);
		$.template_effect(() => $.set_text(text, $.get(result).title));
		$.append($$anchor, p);
	}, ($$anchor) => {
		var p_1 = root_1();
		$.append($$anchor, p_1);
	});
	$.append($$anchor, fragment);
}
