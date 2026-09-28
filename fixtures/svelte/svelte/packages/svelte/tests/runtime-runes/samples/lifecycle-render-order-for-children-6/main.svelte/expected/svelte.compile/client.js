import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div></div>`);
var root_1 = $.from_html(`<div><div></div></div>`);
var root_2 = $.from_html(`<!> <div></div> <!>`, 1);

export default function Main($$anchor) {
	function create_action() {
		let index = 0;

		return () => {
			console.log(index++);
		};
	}

	const content = create_action();
	var fragment = root_2();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var div = root();

			$.action(div, ($$node) => content?.($$node));
			$.append($$anchor, div);
		};

		$.if(node, ($$render) => {
			if (true) $$render(consequent);
		});
	}

	var div_1 = $.sibling(node, 2);

	$.action(div_1, ($$node) => content?.($$node));

	var node_1 = $.sibling(div_1, 2);

	$.each(node_1, 16, () => ({ length: 5 }), $.index, ($$anchor, _) => {
		var div_2 = root_1();
		var div_3 = $.child(div_2);

		$.action(div_3, ($$node) => content?.($$node));
		$.reset(div_2);
		$.append($$anchor, div_2);
	});

	$.append($$anchor, fragment);
}