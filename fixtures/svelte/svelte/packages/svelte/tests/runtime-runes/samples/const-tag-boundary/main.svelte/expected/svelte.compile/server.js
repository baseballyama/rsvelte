import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let count = 1;

	$$renderer.push(`<button>increment</button> `);
	$$renderer.push(`<!--[-->`);

	{
		const double = count * 2;

		$$renderer.push(`<p>${$.escape(double)}</p>`);
	}

	$$renderer.push(`<!--]-->`);
}