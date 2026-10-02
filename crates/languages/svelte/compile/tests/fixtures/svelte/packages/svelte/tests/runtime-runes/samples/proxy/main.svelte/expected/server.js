import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	const object = { count: 0 };

	$$renderer.push(`<button>clicks: ${$.escape(object.count)}</button>`);
}