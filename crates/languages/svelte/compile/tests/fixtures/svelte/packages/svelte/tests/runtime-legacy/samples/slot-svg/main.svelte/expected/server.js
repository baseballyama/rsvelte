import * as $ from 'svelte/internal/server';
import Points from './points.svelte';

export default function Main($$renderer) {
	$$renderer.push(`<svg>`);
	Points($$renderer, {});
	$$renderer.push(`<!----></svg>`);
}