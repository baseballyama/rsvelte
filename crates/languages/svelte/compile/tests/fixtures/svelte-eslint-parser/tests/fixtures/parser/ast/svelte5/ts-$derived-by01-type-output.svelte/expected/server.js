import * as $ from 'svelte/internal/server';

export default function Ts_$derived_by01_type_output($$renderer) {
	const numbers = [1, 2, 3]; // numbers: number[], $state([1, 2, 3]): number[]

	const total = $.derived(() => {
		// total: number, $derived.by(() => { let total = 0; for (const n of numbers) { total += n; } return total; }): number
		let total = 0;

		for (const n of numbers) {
			total += n;
		}

		return total;
	});

	$$renderer.push(`<button>${$.escape(numbers.join(' + '))} = ${$.escape(total())}</button>`);
}