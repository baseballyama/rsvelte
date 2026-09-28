import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	$$renderer.push(`<svg><text x="0" y="50"><tspan>foo</tspan> bar<tspan>foo</tspan> bar</text></svg>`);
}