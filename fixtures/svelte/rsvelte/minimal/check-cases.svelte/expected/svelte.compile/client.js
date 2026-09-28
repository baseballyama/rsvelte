import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p> </p>`);
var root_1 = $.from_html(`<button type="button"> </button> <!> <p> </p>`, 1);

export default function Check_cases($$anchor, $$props) {
	$.push($$props, true);

	let n = 'x';
	let count = 0;
	let maybe = void 0;
	var fragment = root_1();
	var button = $.first_child(fragment);
	var text = $.only_child(button, true);
	var node = $.sibling(button, 2);

	{
		var consequent = ($$anchor) => {
			var p = root();
			var text_1 = $.only_child(p, true);

			$.template_effect(() => $.set_text(text_1, maybe.length));
			$.append($$anchor, p);
		};

		var alternate = ($$anchor) => {
			var p_1 = root();
			var text_2 = $.only_child(p_1, true);

			$.template_effect(() => $.set_text(text_2, maybe.length));
			$.append($$anchor, p_1);
		};

		$.if(node, ($$render) => {
			if (maybe) $$render(consequent); else $$render(alternate, -1);
		});
	}

	var p_2 = $.sibling(node, 2);
	var text_3 = $.only_child(p_2);

	$.template_effect(() => {
		$.set_text(text, $$props.label.foo);
		$.set_attribute(p_2, 'title', `a${count.bar ?? ''}b`);
		$.set_text(text_3, `😀 ${$$props.label.baz ?? ''}`);
	});

	$.delegated('click', button, () => count.toUpperCase());
	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);