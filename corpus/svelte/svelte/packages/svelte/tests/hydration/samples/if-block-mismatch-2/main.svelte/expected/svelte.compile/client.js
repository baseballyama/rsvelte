import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<!> <div><!></div> hello`, 1);

export default function Main($$anchor, $$props) {
	var fragment = root();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			$.slot(node_1, $$props, 'default', {}, null);
			$.append($$anchor, fragment_1);
		};

		$.if(node, ($$render) => {
			if ($$props.condition) $$render(consequent);
		});
	}

	var div = $.sibling(node, 2);
	var node_2 = $.child(div);

	$.slot(node_2, $$props, 'default', {}, null);
	$.reset(div);
	$.next();
	$.append($$anchor, fragment);
}