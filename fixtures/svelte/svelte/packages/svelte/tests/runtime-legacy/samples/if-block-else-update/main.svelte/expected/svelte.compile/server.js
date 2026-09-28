import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let foo = false;
	let bar = [false];

	$$renderer.push(`<button>Toggle foo</button> <button>Toggle bar</button> <hr/> ${$.html(`foo: ${foo}, bar: ${bar.every((x) => x)}`)} <hr/> `);

	if (foo) {
		$$renderer.push(`<!--[0-->foo!`);
	} else if (bar.every((x) => x)) {
		$$renderer.push(`<!--[1-->bar!`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]-->`);
}