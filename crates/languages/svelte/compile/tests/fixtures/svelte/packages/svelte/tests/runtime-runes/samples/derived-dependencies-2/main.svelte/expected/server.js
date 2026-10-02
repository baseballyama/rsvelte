import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let a = true;
	let b = { c: true };
	const x = $.derived(() => b);

	$$renderer.push(`<button>toggle a</button> <button>toggle b</button> `);

	if (x()) {
		$$renderer.push(`<!--[0-->${$.escape(a)}/${$.escape(x().c)}/${$.escape(x().c)}`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]-->`);
}