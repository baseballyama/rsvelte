import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button> </button>`);

export default function _2_2_$derived_by_input($$anchor) {
	let numbers = $.proxy([1, 2, 3]);

	let total = $.derived(() => {
		let total = 0;

		for (const n of numbers) {
			total += n;
		}

		return total;
	});

	var button = root();
	var text = $.only_child(button);

	$.template_effect(($0) => $.set_text(text, `${$0 ?? ''} = ${$.get(total) ?? ''}`), [() => numbers.join(' + ')]);
	$.event('click', button, () => numbers.push(numbers.length + 1));
	$.append($$anchor, button);
}