import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button> </button>`);

export default function Component2($$anchor, $$props) {
	$.push($$props, true);

	let object = $.prop($$props, 'object', 31, () => $.proxy({})),
		primitive = $.prop($$props, 'primitive', 15, '');

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var button = root();
			var text = $.only_child(button, true);

			$.template_effect(() => $.set_text(text, primitive()));
			$.delegated('click', button, () => primitive('bar'));
			$.append($$anchor, button);
		};

		var alternate = ($$anchor) => {
			var button_1 = root();
			var text_1 = $.only_child(button_1, true);

			$.template_effect(() => $.set_text(text_1, object().value));
			$.delegated('click', button_1, () => object(object().value = 'bar', true));
			$.append($$anchor, button_1);
		};

		$.if(node, ($$render) => {
			if (primitive()) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);