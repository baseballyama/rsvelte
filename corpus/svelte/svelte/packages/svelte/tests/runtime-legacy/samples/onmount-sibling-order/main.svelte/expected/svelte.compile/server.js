import * as $ from 'svelte/internal/server';
import Nested from './Nested.svelte';

export default function Main($$renderer) {
	Nested($$renderer, { name: 'foo' });
	$$renderer.push(`<!----> `);
	Nested($$renderer, { name: 'bar' });
	$$renderer.push(`<!---->`);
}