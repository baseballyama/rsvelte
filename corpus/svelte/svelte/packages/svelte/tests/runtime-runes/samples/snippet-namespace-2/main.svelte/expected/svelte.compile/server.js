import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	function p($$renderer) {
		$$renderer.push(`<p>hello</p>`);
	}

	$$renderer.push(`<svg><foreignObject>`);
	p($$renderer);
	$$renderer.push(`<!----></foreignObject></svg>`);
}