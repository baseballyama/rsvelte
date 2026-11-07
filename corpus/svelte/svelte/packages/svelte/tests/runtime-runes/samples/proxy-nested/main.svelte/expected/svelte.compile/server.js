import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	const inner = { count: 0 };
	const object = { outer: { inner } };

	$$renderer.push(`<button>clicks: ${$.escape(object.outer.inner.count)}</button>`);
}