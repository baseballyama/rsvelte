import 'svelte/internal/disclose-version';

import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p> </p>`);

var root_1 = $.from_html(`<p>Ready</p>`);

export default function Boundary_failed_rest($$anchor) {
	var fragment = $.comment();
	var node = $.first_child(fragment);
	{
		const failed = ($$anchor, $$arg0, reset = $.noop) => {
			let message = () => ($$arg0?.()).message;
			let rest = () => $.exclude_from_object($$arg0?.(), ['message']);
			var p = root();
			var text = $.only_child(p);
			$.template_effect(() => $.set_text(text, `${message() ?? ''}: ${rest().name ?? ''}`));
			$.append($$anchor, p);
		};
		$.boundary(node, { failed }, ($$anchor) => {
			var p_1 = root_1();
			$.append($$anchor, p_1);
		});
	}
	$.append($$anchor, fragment);
}
