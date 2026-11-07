import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let inner = Symbol();
	let outer = { inner };

	$$renderer.push(`<button>update</button> <!---->`);

	{
		$$renderer.push(`${$.escape(console.log('rendering'))}`);
	}

	$$renderer.push(`<!---->`);
}