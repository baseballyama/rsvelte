import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	$$renderer.push(`<svg><rect></rect><rect></rect></svg>`);
}