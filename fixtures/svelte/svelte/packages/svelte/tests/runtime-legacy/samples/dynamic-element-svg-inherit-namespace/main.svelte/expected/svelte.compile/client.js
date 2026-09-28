import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_svg(`<foreignObject><!></foreignObject><foreignObject><!></foreignObject>`, 1);
var root_1 = $.from_svg(`<svg></svg><svg><!></svg>`, 1);

export default function Main($$anchor) {
	const iconNode = [["path", { "d": "M21 12a9 9 0 1 1-6.219-8.56" }]];
	var fragment = root_1();
	var svg = $.first_child(fragment);

	$.each(svg, 21, () => iconNode, $.index, ($$anchor, $$item) => {
		var $$array = $.derived(() => $.to_array($.get($$item), 2));
		let tag = () => $.get($$array)[0];
		let attrs = () => $.get($$array)[1];
		var fragment_1 = $.comment();
		var node = $.first_child(fragment_1);

		$.element(node, tag, true, ($$element, $$anchor) => {
			$.attribute_effect($$element, () => ({ ...attrs() }));
		});

		$.append($$anchor, fragment_1);
	});

	$.reset(svg);

	var svg_1 = $.sibling(svg);
	var node_1 = $.child(svg_1);

	$.element(node_1, () => "path", true, ($$element_1, $$anchor) => {
		var fragment_2 = root();
		var foreignObject = $.first_child(fragment_2);
		var node_2 = $.child(foreignObject);

		$.element(node_2, () => "span", false, ($$element_2, $$anchor) => {
			var text = $.text('ok');

			$.append($$anchor, text);
		});

		$.reset(foreignObject);

		var foreignObject_1 = $.sibling(foreignObject);
		var node_3 = $.child(foreignObject_1);

		{
			var consequent = ($$anchor) => {
				var fragment_3 = $.comment();
				var node_4 = $.first_child(fragment_3);

				$.element(node_4, () => "span", false, ($$element_3, $$anchor) => {
					var text_1 = $.text('ok');

					$.append($$anchor, text_1);
				});

				$.append($$anchor, fragment_3);
			};

			$.if(node_3, ($$render) => {
				if (true) $$render(consequent);
			});
		}

		$.reset(foreignObject_1);
		$.append($$anchor, fragment_2);
	});

	$.reset(svg_1);
	$.append($$anchor, fragment);
}