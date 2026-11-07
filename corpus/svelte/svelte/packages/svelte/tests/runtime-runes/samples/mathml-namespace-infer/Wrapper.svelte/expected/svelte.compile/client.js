import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

const test = ($$anchor, text = $.noop) => {
	var mrow = root();

	$.append($$anchor, mrow);
};

var root = $.from_mathml(`<mrow></mrow>`);
var root_1 = $.from_mathml(`<mrow></mrow> <!> <!> <!> <!>`, 1);

export default function Wrapper($$anchor, $$props) {
	$.push($$props, true);

	var fragment = root_1();
	var node = $.sibling($.first_child(fragment), 2);

	{
		var consequent = ($$anchor) => {
			var mrow_1 = root();

			$.append($$anchor, mrow_1);
		};

		$.if(node, ($$render) => {
			if (true) $$render(consequent);
		});
	}

	var node_1 = $.sibling(node, 2);

	$.each(node_1, 16, () => Array(2).fill(0), $.index, ($$anchor, item) => {
		var mrow_2 = root();

		$.append($$anchor, mrow_2);
	});

	var node_2 = $.sibling(node_1, 2);

	$.html(node_2, () => '<mrow></mrow>', void 0, void 0, true);

	var node_3 = $.sibling(node_2, 2);

	test(node_3);
	$.append($$anchor, fragment);
	$.pop();
}