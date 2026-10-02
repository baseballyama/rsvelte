import * as $ from 'svelte/internal/server';
import Nested from './Nested.svelte';

export default function Main($$renderer) {
	$$renderer.push(`<main>`);
	Nested($$renderer, {});
	$$renderer.push(`<!----></main>`);
}