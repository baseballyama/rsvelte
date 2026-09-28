import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let show = false;
	let count = 0;

	$$renderer.push(`<button>toggle</button> <button>count: ${$.escape(count)}</button> <p>show: ${$.escape(show)}</p> `);

	if (show) {
		$$renderer.push('<!--[0-->');
		NonExistent($$renderer, {});
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]-->`);
}