import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let bgImage = 'https://example.com/foo.jpg';
	let color = 'red';

	$$renderer.push(`<div style="background-image: url('https://example.com/foo.jpg'); color: red;">red</div>`);
}