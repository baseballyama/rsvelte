import 'svelte/internal/disclose-version';
import 'svelte/internal/flags/legacy';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p> </p> <p> </p>`, 1);
var root_1 = $.from_html(`<input/> <!>`, 1);

export default function Main($$anchor, $$props) {
	$.push($$props, false);

	let message = $.mutable_source('hello');

	$.init();

	var fragment = root_1();
	var input = $.first_child(fragment);

	$.remove_input_defaults(input);

	var node = $.sibling(input, 2);

	{
		var consequent = ($$anchor) => {
			const m1 = $.derived_safe_equal(() => $.get(message));

			const m2 = $.derived_safe_equal(() => (
				$.deep_read_state($.get(m1)),
				$.untrack(() => (() => $.get(m1))())
			));

			var fragment_1 = root();
			var p = $.first_child(fragment_1);
			var text = $.only_child(p, true);
			var p_1 = $.sibling(p, 2);
			var text_1 = $.only_child(p_1, true);

			$.template_effect(() => {
				$.set_text(text, $.get(m1));
				$.set_text(text_1, $.get(m2));
			});

			$.append($$anchor, fragment_1);
		};

		$.if(node, ($$render) => {
			if (true) $$render(consequent);
		});
	}

	$.bind_value(input, () => $.get(message), ($$value) => $.set(message, $$value));
	$.append($$anchor, fragment);
	$.pop();
}