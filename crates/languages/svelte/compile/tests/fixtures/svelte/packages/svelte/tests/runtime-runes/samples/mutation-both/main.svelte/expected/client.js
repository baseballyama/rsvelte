import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<span> </span> <button>Increase multiplier</button> <button>Increase count</button>`, 1);

export default function Main($$anchor) {
	let count = $.state(0);

	const multiplier = () => {
		let multiplier = $.state(2);
		let multiple = $.derived(() => $.get(count) * $.get(multiplier));

		return {
			get count() {
				return $.get(multiple);
			},

			get multiplier() {
				return $.get(multiplier);
			},
			inc: () => $.update(multiplier)
		};
	};

	const multiplied = multiplier();
	var fragment = root();
	var span = $.first_child(fragment);
	var text = $.only_child(span);
	var button = $.sibling(span, 2);
	var button_1 = $.sibling(button, 2);

	$.template_effect(() => $.set_text(text, `${$.get(count) ?? ''} * ${multiplied.multiplier ?? ''} = ${multiplied.count ?? ''}`));

	$.event('click', button, function (...$$args) {
		multiplied.inc?.apply(this, $$args);
	});

	$.event('click', button_1, () => $.update(count));
	$.append($$anchor, fragment);
}