import * as $ from 'svelte/internal/server';
import Nested from './Nested.svelte';

export default function Main($$renderer) {
	let value = { count: 1 };

	$$renderer.push(`<button>reassign</button> `);
	Nested($$renderer, { primitive: value.count, object: value });
	$$renderer.push(`<!---->`);
}