import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<input/>`);

export default function Main($$anchor) {
	let focused = $.state(false);

	function get_rest() {
		console.log("get_rest");

		return { "data-rest": "true" };
	}

	var input = root();
	var event_handler = () => $.set(focused, true);
	var event_handler_1 = () => $.set(focused, false);

	$.attribute_effect(
		input,
		($0) => ({
			onfocus: event_handler,
			onblur: event_handler_1,
			class: `${$.get(focused) ? 'focused' : ''}`,
			...$0,
			[$.CLASS]: { dark: true }
		}),
		[() => get_rest()],
		void 0,
		void 0,
		void 0,
		true
	);

	$.append($$anchor, input);
}