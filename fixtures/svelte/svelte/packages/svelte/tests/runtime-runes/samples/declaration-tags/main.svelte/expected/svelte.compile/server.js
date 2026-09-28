import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let visible = true;
	let initial = 2;
	let top = 1;
	let top_doubled = $.derived(() => top * 2);

	$$renderer.push(`<button>top ${$.escape(top_doubled())}</button> <button>toggle</button> `);

	if (visible) {
		$$renderer.push('<!--[0-->');

		let counter = { value: initial };
		let doubled = $.derived(() => counter.value * 2);
		const suffix = ' total';
		const format = (value) => `${value}${suffix}`;

		$$renderer.push(`<button>${$.escape(counter.value)}</button> <p>${$.escape(format(doubled()))}</p> `);

		{
			const doubled = 'nested';

			$$renderer.push(`<div><span>nested</span></div>`);
		}
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]--> `);

	{
		const nested = 'nested';

		$$renderer.push(`<div><span>nested</span></div>`);
	}
}