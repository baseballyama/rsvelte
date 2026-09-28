import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let foo = 0;
	let bar = { bar: 0 };

	$$renderer.push(`<p>${$.escape(foo)}</p> <button>foo++</button> <button>++foo</button> <p>${$.escape(bar.bar)}</p> <button>bar.bar++</button> <button>++bar.bar</button>`);
}