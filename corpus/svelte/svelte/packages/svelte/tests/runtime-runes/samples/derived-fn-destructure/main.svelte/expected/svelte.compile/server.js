import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let count = 0;

	function create_derived() {
		console.log('create_derived');

		return () => {
			return {
				get double() {
					return count * 2;
				}
			};
		};
	}

	let $$d = $.derived(create_derived()),
		double = $.derived(() => $$d().double);

	$$renderer.push(`<button>${$.escape(double())}</button>`);
}