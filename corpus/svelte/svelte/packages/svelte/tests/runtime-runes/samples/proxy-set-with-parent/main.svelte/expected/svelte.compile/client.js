import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<input/>`);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	function with_writes(initialState) {
		const derive = $.proxy(initialState);

		return derive;
	}

	let data = $.proxy({ example: 'Example' });
	let my_derived = $.derived(() => with_writes({ example: data.example }));

	$.user_effect(() => {
		$.get(my_derived).example = 'Bar';
	});

	var input = root();

	$.remove_input_defaults(input);
	$.bind_value(input, () => data.example, ($$value) => data.example = $$value);
	$.append($$anchor, input);
	$.pop();
}