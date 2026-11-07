import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

const test = ($$anchor, text = $.noop) => {
	var text_1 = root();

	$.set_attribute(text_1, 'x', 20);
	$.set_attribute(text_1, 'y', 42);

	var text_2 = $.only_child(text_1, true);

	$.template_effect(() => $.set_text(text_2, text()));
	$.append($$anchor, text_1);
};

var root = $.from_svg(`<text> </text>`);
var root_1 = $.from_svg(`<text x="0" y="26">true</text>`);
var root_2 = $.from_svg(`<text></text>`);
var root_3 = $.from_svg(`<text x="0" y="14">outside</text><!><!><!><!>`, 1);

export default function Wrapper($$anchor, $$props) {
	$.push($$props, true);

	var fragment = root_3();
	var node = $.sibling($.first_child(fragment));

	{
		var consequent = ($$anchor) => {
			var text_3 = root_1();

			$.append($$anchor, text_3);
		};

		$.if(node, ($$render) => {
			if (true) $$render(consequent);
		});
	}

	var node_1 = $.sibling(node);

	$.each(node_1, 16, () => Array(2).fill(0), $.index, ($$anchor, item, idx) => {
		var text_4 = root_2();

		$.set_attribute(text_4, 'x', idx * 10);
		$.set_attribute(text_4, 'y', 42);
		text_4.textContent = idx;
		$.append($$anchor, text_4);
	});

	var node_2 = $.sibling(node_1);

	$.html(node_2, () => '<text x="0" y="40">html</text>', void 0, true);

	var node_3 = $.sibling(node_2);

	test(node_3, () => "snippet");
	$.append($$anchor, fragment);
	$.pop();
}