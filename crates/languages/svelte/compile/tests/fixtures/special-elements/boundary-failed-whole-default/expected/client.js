import 'svelte/internal/disclose-version';

import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p> </p>`);

var root_1 = $.from_html(`<p>Ready</p>`);

export default function Boundary_failed_whole_default($$anchor) {
	var fragment = $.comment();
	var node = $.first_child(fragment);
	{
		const failed = ($$anchor, $$arg0, reset = $.noop) => {
			let message = $.derived_safe_equal(() => ($.fallback($$arg0?.(), () => ({ message: "Unknown" }), true)).message);
			var p = root();
			var text = $.only_child(p, true);
			$.template_effect(() => $.set_text(text, $.get(message)));
			$.append($$anchor, p);
		};
		$.boundary(node, { failed }, ($$anchor) => {
			var p_1 = root_1();
			$.append($$anchor, p_1);
		});
	}
	$.append($$anchor, fragment);
}
