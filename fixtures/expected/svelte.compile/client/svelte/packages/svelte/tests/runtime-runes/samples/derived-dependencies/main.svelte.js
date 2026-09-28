import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<h1> </h1> <p> </p>`, 1);
var root_1 = $.from_html(`<!> <button>hide</button> <button>show</button>`, 1);

export default function Main($$anchor) {
	let data = $.state($.proxy({ event: { author: 'John Doe', body: 'Body' } }));
	const event = $.derived(() => $.get(data).event);
	var fragment = root_1();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var fragment_1 = root();
			var h1 = $.first_child(fragment_1);
			var text = $.only_child(h1, true);
			var p = $.sibling(h1, 2);
			var text_1 = $.only_child(p, true);

			$.template_effect(() => {
				$.set_text(text, $.get(event).author);
				$.set_text(text_1, $.get(event).body);
			});

			$.append($$anchor, fragment_1);
		};

		$.if(node, ($$render) => {
			if ($.get(event)) $$render(consequent);
		});
	}

	var button = $.sibling(node, 2);
	var button_1 = $.sibling(button, 2);

	$.delegated('click', button, () => {
		$.set(data, {}, true);
	});

	$.delegated('click', button_1, () => {
		$.set(data, { event: { author: 'John Doe', body: 'Body' } }, true);
	});

	$.append($$anchor, fragment);
}

$.delegate(['click']);