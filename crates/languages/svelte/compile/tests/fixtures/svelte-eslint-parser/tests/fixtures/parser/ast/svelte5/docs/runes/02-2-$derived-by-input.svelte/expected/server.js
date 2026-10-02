import * as $ from 'svelte/internal/server';

export default function _2_2_$derived_by_input($$renderer) {
	let numbers = [1, 2, 3];

	let total = $.derived(() => {
		let total = 0;

		for (const n of numbers) {
			total += n;
		}

		return total;
	});

	$$renderer.push(`<button>${$.escape(numbers.join(' + '))} = ${$.escape(total())}</button>`);
}