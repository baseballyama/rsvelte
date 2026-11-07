import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<h1></h1>`);
var root_1 = $.from_html(`<h2></h2>`);
var root_2 = $.from_html(`<h3></h3>`);
var root_3 = $.from_html(`<h2>Hello There</h2>`);
var root_4 = $.from_html(`<h2>hi</h2>`);
var root_5 = $.from_html(`<h3>hello</h3>`);
var root_6 = $.from_html(`<!> <!> <!>`, 1);

export default function Input($$anchor) {
	var fragment = root_6();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var h1 = root();

			h1.textContent = `Hello ${name2 ?? ''}`;
			$.append($$anchor, h1);
		};

		var consequent_1 = ($$anchor) => {
			var h2 = root_1();

			h2.textContent = `hello ${name4 ?? ''}`;
			$.append($$anchor, h2);
		};

		var alternate = ($$anchor) => {
			var h3 = root_2();

			h3.textContent = `hey ${name5 ?? ''}`;
			$.append($$anchor, h3);
		};

		$.if(node, ($$render) => {
			if (name1 == "world") $$render(consequent); else if (name3 == "person") $$render(consequent_1, 1); else $$render(alternate, -1);
		});
	}

	var node_1 = $.sibling(node, 2);

	{
		var consequent_2 = ($$anchor) => {
			var h2_1 = root_3();

			$.append($$anchor, h2_1);
		};

		$.if(node_1, ($$render) => {
			if (kenobi) $$render(consequent_2);
		});
	}

	var node_2 = $.sibling(node_1, 2);

	{
		var consequent_3 = ($$anchor) => {
			var h2_2 = root_4();

			$.append($$anchor, h2_2);
		};

		var alternate_1 = ($$anchor) => {
			var h3_1 = root_5();

			$.append($$anchor, h3_1);
		};

		$.if(node_2, ($$render) => {
			if (name1 = 'hi') $$render(consequent_3); else $$render(alternate_1, -1);
		});
	}

	$.append($$anchor, fragment);
}