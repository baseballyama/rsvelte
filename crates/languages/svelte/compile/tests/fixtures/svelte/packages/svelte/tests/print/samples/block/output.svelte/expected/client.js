import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p> </p>`);
var root_1 = $.from_html(`<!> <!> <!> <!>`, 1);

export default function Output($$anchor) {
	var fragment = root_1();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var text = $.text('yes');

			$.append($$anchor, text);
		};

		var alternate = ($$anchor) => {
			var text_1 = $.text('no');

			$.append($$anchor, text_1);
		};

		$.if(node, ($$render) => {
			if (condition) $$render(consequent); else $$render(alternate, -1);
		});
	}

	var node_1 = $.sibling(node, 2);

	$.each(node_1, 16, () => items, $.index, ($$anchor, item, i) => {
		var p = root();
		var text_2 = $.only_child(p);

		$.template_effect(() => $.set_text(text_2, `${i}: ${item ?? ''}`));
		$.append($$anchor, p);
	});

	var node_2 = $.sibling(node_1, 2);

	{
		var consequent_1 = ($$anchor) => {
			var text_3 = $.text('yes');

			$.append($$anchor, text_3);
		};

		var alternate_1 = ($$anchor) => {
			var text_4 = $.text('no');

			$.append($$anchor, text_4);
		};

		$.if(node_2, ($$render) => {
			if (condition) $$render(consequent_1); else $$render(alternate_1, -1);
		});
	}

	var node_3 = $.sibling(node_2, 2);

	$.each(node_3, 16, () => items, $.index, ($$anchor, item, i) => {
		var p_1 = root();
		var text_5 = $.only_child(p_1);

		$.template_effect(() => $.set_text(text_5, `${i}: ${item ?? ''}`));
		$.append($$anchor, p_1);
	});

	$.append($$anchor, fragment);
}