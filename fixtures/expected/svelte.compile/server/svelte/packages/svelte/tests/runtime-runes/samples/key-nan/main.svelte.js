import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let x = NaN;

	$$renderer.push(`<button>update</button> <!---->`);

	{
		$$renderer.push(`${$.escape(console.log('rendering'))} <p>it rendered</p>`);
	}

	$$renderer.push(`<!---->`);
}