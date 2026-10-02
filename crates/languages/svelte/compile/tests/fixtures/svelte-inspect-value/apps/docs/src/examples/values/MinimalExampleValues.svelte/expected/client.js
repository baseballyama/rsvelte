import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Inspect from 'svelte-inspect-value';

var root = $.from_html(`<div class="svelte-qov40i"><input type="number" class="svelte-qov40i"/> <!></div>`);

export default function MinimalExampleValues($$anchor, $$props) {
	$.push($$props, true);

	let number = $.state(1);
	let isEven = $.derived(() => $.get(number) % 2 === 0);
	let doubled = $.derived(() => $.get(number) * 2);

	const Ins = Inspect.Values.withOptions(() => ({
		expandLevel: 0,
		elementAttributes: { style: 'max-width: 500px', class: 'not-content mt' }
	}));

	var div = root();
	var input = $.child(div);

	$.remove_input_defaults(input);

	var node = $.sibling(input, 2);

	Ins(node, {
		get number() {
			return $.get(number);
		},

		get isEven() {
			return $.get(isEven);
		},

		get doubled() {
			return $.get(doubled);
		}
	});

	$.reset(div);
	$.bind_value(input, () => $.get(number), ($$value) => $.set(number, $$value));
	$.append($$anchor, div);
	$.pop();
}