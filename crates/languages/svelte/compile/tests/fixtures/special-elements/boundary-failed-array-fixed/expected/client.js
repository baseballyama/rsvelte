import 'svelte/internal/disclose-version';

import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p> </p>`);

var root_1 = $.from_html(`<p>Ready</p>`);

export default function Boundary_failed_array_fixed($$anchor) {
	var fragment = $.comment();
	var node = $.first_child(fragment);
	{
		const failed = ($$anchor, $$arg0, reset = $.noop) => {
			var $$array = $.derived(() => $.to_array($$arg0?.(), 3));
			let first = () => $.get($$array)[0];
			let third = () => $.get($$array)[2];
			var p = root();
			var text = $.only_child(p);
			$.template_effect(() => $.set_text(text, `${first() ?? ''}: ${third() ?? ''}`));
			$.append($$anchor, p);
		};
		$.boundary(node, { failed }, ($$anchor) => {
			var p_1 = root_1();
			$.append($$anchor, p_1);
		});
	}
	$.append($$anchor, fragment);
}
