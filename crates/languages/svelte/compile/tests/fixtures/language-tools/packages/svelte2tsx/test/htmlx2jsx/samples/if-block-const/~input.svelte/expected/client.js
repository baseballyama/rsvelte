import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<h1> </h1>`);
var root_1 = $.from_html(`<!> <!> <!> <!>`, 1);

export default function Input($$anchor) {
	var fragment = root_1();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			const hello = $.derived(() => name);
			var h1 = root();
			var text = $.only_child(h1);

			$.template_effect(() => $.set_text(text, `Hello ${$.get(hello) ?? ''}`));
			$.append($$anchor, h1);
		};

		var consequent_1 = ($$anchor) => {
			const hello = $.derived(() => name);
			var h1_1 = root();
			var text_1 = $.only_child(h1_1);

			$.template_effect(() => $.set_text(text_1, `Hello ${$.get(hello) ?? ''}`));
			$.append($$anchor, h1_1);
		};

		var alternate = ($$anchor) => {
			const hello = $.derived(() => name);
			var h1_2 = root();
			var text_2 = $.only_child(h1_2);

			$.template_effect(() => $.set_text(text_2, `Hello ${$.get(hello) ?? ''}`));
			$.append($$anchor, h1_2);
		};

		$.if(node, ($$render) => {
			if (name == "world") $$render(consequent); else if (true) $$render(consequent_1, 1); else $$render(alternate, -1);
		});
	}

	var node_1 = $.sibling(node, 2);

	{
		var consequent_2 = ($$anchor) => {
			const aStr = $.derived(() => a);
			const aStr2 = $.derived(() => $.get(aStr));
			var text_3 = $.text();

			text_3.nodeValue = a;
			$.append($$anchor, text_3);
		};

		var consequent_3 = ($$anchor) => {
			const aNum = $.derived(() => a);
		};

		$.if(node_1, ($$render) => {
			if (typeof a === 'string') $$render(consequent_2); else if (typeof a === 'number') $$render(consequent_3, 1);
		});
	}

	var node_2 = $.sibling(node_1, 2);

	{
		var consequent_4 = ($$anchor) => {
			const aStr = $.derived(() => a);
		};

		$.if(node_2, ($$render) => {
			if (typeof a === 'string') $$render(consequent_4);
		});
	}

	var node_3 = $.sibling(node_2, 2);

	{
		var consequent_5 = ($$anchor) => {
			const aStr = $.derived(() => a);
		};

		var alternate_1 = ($$anchor) => {};

		$.if(node_3, ($$render) => {
			if (typeof a === 'string') $$render(consequent_5); else $$render(alternate_1, -1);
		});
	}

	$.append($$anchor, fragment);
}