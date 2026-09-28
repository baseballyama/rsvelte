import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<span> </span>`);
var root_1 = $.from_html(`<!> <button>clear</button>`, 1);

export default function Main($$anchor) {
	let value = $.state('hello');
	let elements = {};
	var fragment = root_1();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var span = root();
			var text = $.only_child(span, true);

			$.bind_this(span, ($$value) => elements[$.get(value).toUpperCase()] = $$value, () => elements?.[$.get(value).toUpperCase()]);
			$.template_effect(() => $.set_text(text, $.get(value)));
			$.append($$anchor, span);
		};

		$.if(node, ($$render) => {
			if ($.get(value)) $$render(consequent);
		});
	}

	var button = $.sibling(node, 2);

	$.delegated('click', button, () => $.set(value, undefined));
	$.append($$anchor, fragment);
}

$.delegate(['click']);