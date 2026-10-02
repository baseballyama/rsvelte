import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<code>2</code>`);
var root_1 = $.from_html(`<p><span>1</span> <!></p>`);

export default function Main($$anchor) {
	var p = root_1();
	var node = $.sibling($.child(p), 2);

	{
		var consequent = ($$anchor) => {
			var code = root();

			$.append($$anchor, code);
		};

		$.if(node, ($$render) => {
			if (true) $$render(consequent);
		});
	}

	$.reset(p);
	$.append($$anchor, p);
}