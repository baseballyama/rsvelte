import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let count = 0;

	const multiplier = () => {
		let multiplier = 2;
		let multiple = $.derived(() => count * multiplier);

		return {
			get count() {
				return multiple();
			},

			get multiplier() {
				return multiplier;
			},
			inc: () => multiplier++
		};
	};

	const multiplied = multiplier();

	$$renderer.push(`<span>${$.escape(count)} * ${$.escape(multiplied.multiplier)} = ${$.escape(multiplied.count)}</span> <button>Increase multiplier</button> <button>Increase count</button>`);
}