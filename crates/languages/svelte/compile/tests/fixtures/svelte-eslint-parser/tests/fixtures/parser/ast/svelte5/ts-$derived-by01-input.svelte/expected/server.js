import * as $ from 'svelte/internal/server';

export default function Ts_$derived_by01_input($$renderer) {
	const numbers = [1, 2, 3];

	const total = $.derived(() => {
		let total = 0;

		for (const n of numbers) {
			total += n;
		}

		return total;
	});

	$$renderer.push(`<button>${$.escape(numbers.join(' + '))} = ${$.escape(total())}</button>`);
}