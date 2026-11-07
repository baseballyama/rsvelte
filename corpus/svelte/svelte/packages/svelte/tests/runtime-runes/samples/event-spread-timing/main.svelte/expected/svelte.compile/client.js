import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<input/>`);

export default function Main($$anchor) {
	const focus = (input) => {
		input.focus();
	};

	var input_1 = root();
	var event_handler = () => console.log("onfocus");

	$.attribute_effect(input_1, () => ({ ...{}, onfocus: event_handler }), void 0, void 0, void 0, void 0, true);
	$.action(input_1, ($$node) => focus?.($$node));
	$.append($$anchor, input_1);
}