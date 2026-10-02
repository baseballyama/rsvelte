import 'svelte/internal/disclose-version';

import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p>yes</p>`);

var root_1 = $.from_html(`<p>no</p>`);

export default function If_block($$anchor, $$props) {
	var fragment = $.comment();
	var node = $.first_child(fragment);
	{
		var consequent = ($$anchor) => {
			var p = root();
			$.append($$anchor, p);
		};
		var alternate = ($$anchor) => {
			var p_1 = root_1();
			$.append($$anchor, p_1);
		};
		$.if(node, ($$render) => {
			if ($$props.ok) $$render(consequent); else $$render(alternate, -1);
		});
	}
	$.append($$anchor, fragment);
}
