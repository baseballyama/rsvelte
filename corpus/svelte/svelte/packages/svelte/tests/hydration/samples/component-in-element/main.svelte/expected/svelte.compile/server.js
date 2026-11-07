import * as $ from 'svelte/internal/server';
import Nested from './Nested.svelte';

export default function Main($$renderer) {
	$$renderer.push(`<div>`);
	Nested($$renderer, {});
	$$renderer.push(`<!----></div>`);
}