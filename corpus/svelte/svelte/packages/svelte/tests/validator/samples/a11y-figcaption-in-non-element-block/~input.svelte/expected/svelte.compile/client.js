import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<figcaption></figcaption>`);
var root_1 = $.from_html(`<figure><img src="foo.jpg" alt="a foo"/> <!></figure>`);

export default function Input($$anchor) {
	let caption = 'a foo in its natural habitat';
	var figure = root_1();
	var node = $.sibling($.child(figure), 2);

	{
		var consequent = ($$anchor) => {
			var figcaption = root();

			figcaption.textContent = 'a foo in its natural habitat';
			$.append($$anchor, figcaption);
		};

		$.if(node, ($$render) => {
			if (caption) $$render(consequent);
		});
	}

	$.reset(figure);
	$.append($$anchor, figure);
}