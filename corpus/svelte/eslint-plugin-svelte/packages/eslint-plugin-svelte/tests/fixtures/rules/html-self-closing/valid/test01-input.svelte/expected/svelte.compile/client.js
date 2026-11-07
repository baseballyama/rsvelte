import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div class="hello"><div></div> <div>hello</div> <img/> <svg><path></path></svg> <math><msup></msup></math> <!> <!></div>`);

export default function Test01_input($$anchor) {
	var div = root();
	var node = $.sibling($.child(div), 10);

	{
		var consequent = ($$anchor) => {
			var fragment = $.comment();
			var node_1 = $.first_child(fragment);

			Test01_input(node_1, {});
			$.append($$anchor, fragment);
		};

		$.if(node, ($$render) => {
			if (true) $$render(consequent);
		});
	}

	var node_2 = $.sibling(node, 2);

	I.Am.A.Foo(node_2, {});
	$.reset(div);
	$.append($$anchor, div);
}