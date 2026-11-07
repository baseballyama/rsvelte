import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<input type="text"/>`);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	let bar = $.state('');

	const foo = {
		set bar(v) {
			console.log($.effect_tracking());
			$.set(bar, v, true);
		},

		get bar() {
			return $.get(bar);
		}
	};

	let input;

	$.user_effect(() => {
		input.value = 'everybody';
		input.dispatchEvent(new window.Event('input'));
	});

	var input_1 = root();

	$.remove_input_defaults(input_1);
	$.bind_this(input_1, ($$value) => input = $$value, () => input);
	$.bind_value(input_1, () => foo.bar, ($$value) => foo.bar = $$value);
	$.append($$anchor, input_1);
	$.pop();
}