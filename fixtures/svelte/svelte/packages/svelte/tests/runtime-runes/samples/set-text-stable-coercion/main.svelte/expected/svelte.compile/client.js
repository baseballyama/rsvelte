import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(` <p> </p> <p> </p> <!>`, 1);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	class Widget {
		toString() {
			return "toString";
		}

		valueOf() {
			return "valueOf";
		}
	}

	const value = new Widget();

	$.next();

	var fragment = root();
	var text = $.first_child(fragment);
	var p = $.sibling(text);
	var text_1 = $.only_child(p, true);
	var p_1 = $.sibling(p, 2);
	var text_2 = $.only_child(p_1);
	var node = $.sibling(p_1, 2);

	{
		var consequent = ($$anchor) => {
			var text_3 = $.text();

			$.template_effect(() => $.set_text(text_3, value));
			$.append($$anchor, text_3);
		};

		$.if(node, ($$render) => {
			if (1) $$render(consequent);
		});
	}

	$.template_effect(() => {
		$.set_text(text, `${value ?? ''} `);
		$.set_text(text_1, value);
		$.set_text(text_2, `[${value ?? ''}]`);
	});

	$.append($$anchor, fragment);
	$.pop();
}