import * as $ from 'svelte/internal/server';
import Nested from './Nested.svelte';

export default function Main($$renderer) {
	let nested;

	$$renderer.push(`<button>Click Me</button> `);
	Nested($$renderer, {});
	$$renderer.push(`<!---->`);
}