import * as $ from 'svelte/internal/server';

export default function Sub($$renderer, $$props) {
	let count = 0;

	function _increment() {
		count += 1;
	}

	const decrement = () => {
		count -= 1;
	};

	const double = function () {
		count = count * 2;
	};

	$$renderer.push(`<p>clicks: ${$.escape(count)}</p>`);
	$.bind_props($$props, { increment: _increment, decrement, double });
}