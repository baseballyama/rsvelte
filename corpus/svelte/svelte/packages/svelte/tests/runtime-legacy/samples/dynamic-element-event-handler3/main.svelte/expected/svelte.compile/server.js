import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let makeHandler = null;

	makeHandler = () => {
		console.log('create');

		return () => console.log('trigger');
	};

	$$renderer.push(`<button>Click</button>`);
}