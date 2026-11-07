import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	const action = () => {};

	$$renderer.push(`<div><div><div><button>Button</button></div></div></div>`);
}