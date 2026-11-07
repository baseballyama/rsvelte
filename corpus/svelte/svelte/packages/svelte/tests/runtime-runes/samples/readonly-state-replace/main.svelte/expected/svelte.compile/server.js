import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let items = [0];

	const addItem = () => {
		items = [...items, items.length];
	};

	$$renderer.push(`<button>${$.escape(items.join(', '))}</button>`);
}