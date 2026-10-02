import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<input/>`);

export default function Main($$anchor) {
	var input = root();

	$.attribute_effect(
		input,
		() => ({
			...{ foo: null },
			readonly: false,
			required: false,
			disabled: null
		}),
		void 0,
		void 0,
		void 0,
		void 0,
		true
	);

	$.append($$anchor, input);
}