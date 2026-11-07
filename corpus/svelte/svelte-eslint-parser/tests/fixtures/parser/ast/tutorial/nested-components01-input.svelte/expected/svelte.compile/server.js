import * as $ from 'svelte/internal/server';
import Nested from './Nested.svelte';

export default function Nested_components01_input($$renderer) {
	$$renderer.push(`<p>This is a paragraph.</p> `);
	Nested($$renderer, {});
	$$renderer.push(`<!---->`);
}