import 'svelte/internal/disclose-version';

import * as $ from 'svelte/internal/client';

var root = $.from_html(`<meta name="test" content="shown"/>`);

var root_1 = $.from_html(`<p>Body</p>`);

export default function Head_nested($$anchor) {
	let show = true;
	var p = root_1();
	$.head('12tw8ly', ($$anchor) => {
		var fragment = $.comment();
		var node = $.first_child(fragment);
		{
			var consequent = ($$anchor) => {
				var meta = root();
				$.effect(() => {
					$.document.title = 'Shown';
				});
				$.append($$anchor, meta);
			};
			$.if(node, ($$render) => {
				if (show) $$render(consequent);
			});
		}
		$.append($$anchor, fragment);
	});
	$.append($$anchor, p);
}
