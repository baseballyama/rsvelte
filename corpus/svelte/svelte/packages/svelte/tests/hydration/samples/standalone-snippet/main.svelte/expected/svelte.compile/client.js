import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

const thing = ($$anchor) => {
	var p = root();

	$.append($$anchor, p);
};

var root = $.from_html(`<p>thing</p>`);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function Main($$anchor) {
	var fragment = root_1();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			thing($$anchor);
		};

		$.if(node, ($$render) => {
			if (true) $$render(consequent);
		});
	}

	var node_1 = $.sibling(node, 2);

	$.each(node_1, 16, () => [1, 2, 3], $.index, ($$anchor, n) => {
		thing($$anchor);
	});

	$.append($$anchor, fragment);
}