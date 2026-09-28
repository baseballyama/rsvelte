import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	function foo(node) {
		return {
			duration: 100,
			tick: (t, u) => {
				node.setAttribute('foo', t);
			}
		};
	}

	let x = true;
	let y = true;

	$$renderer.push(`<button>toggle x</button> <button>toggle y</button> `);

	if (x && y) {
		$$renderer.push(`<!--[0--><p>hello</p>`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]-->`);
}