import * as $ from 'svelte/internal/server';

export default function Counter_svue($$renderer) {
	let count = 0;
	const double = $.derived(() => count * 2);

	function increment() {
		count += 1;
	}

	$$renderer.push(`<button type="button"${$.attr('disabled', count > 9, true)}>clicks: ${$.escape(count)}</button> <p>double is ${$.escape(double())}</p>`);
}