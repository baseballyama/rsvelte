import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button> </button>`);

export default function Ts_$derived_by01_type_output($$anchor) {
	const numbers = $.proxy([1, 2, 3] // numbers: number[], $state([1, 2, 3]): number[]
	);

	const total = $.derived(() => {
		// total: number, $derived.by(() => { let total = 0; for (const n of numbers) { total += n; } return total; }): number
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