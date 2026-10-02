import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<!> <!> <!> <!> <!>`, 1);

export default function Output($$anchor, $$props) {
	$.push($$props, true);

	var fragment = root();
	var node = $.first_child(fragment);

	$.html(node, () => "some html");

	var node_1 = $.sibling(node, 2);

	{
		var consequent = ($$anchor) => {
			var text = $.text('true');

			$.append($$anchor, text);
		};

		var consequent_1 = ($$anchor) => {
			var text_1 = $.text('false');

			$.append($$anchor, text_1);
		};

		$.if(node_1, ($$render) => {
			if (false && ({}).x === 34) $$render(consequent); else if (false) $$render(consequent_1, 1);
		});
	}

	var node_2 = $.sibling(node_1, 2);

	$.await(
		node_2,
		() => [],
		($$anchor) => {
			const x = $.derived(() => 43);
			var text_4 = $.text();

			text_4.nodeValue = $.get(x);
			$.append($$anchor, text_4);
		},
		($$anchor, i) => {
			var text_2 = $.text();

			$.template_effect(() => $.set_text(text_2, $.get(i)));
			$.append($$anchor, text_2);
		},
		($$anchor, e) => {
			var text_3 = $.text('dlkdj');

			$.append($$anchor, text_3);
		}
	);

	var node_3 = $.sibling(node_2, 2);

	$.await(node_3, () => [], null, ($$anchor, i) => {
		var text_5 = $.text('stuff');

		$.append($$anchor, text_5);
	});

	var node_4 = $.sibling(node_3, 2);

	$.key(node_4, () => count, ($$anchor) => {
		var text_6 = $.text('dlkdj');

		$.append($$anchor, text_6);
	});

	$.append($$anchor, fragment);
	$.pop();
}