import * as $ from 'svelte/internal/server';
import Rect from './rect.svelte';

export default function Main($$renderer) {
	$$renderer.push(`<svg>`);
	Rect($$renderer, {});
	$$renderer.push(`<!----></svg>`);
}