import * as $ from 'svelte/internal/server';
import Svg from './svg.svelte';

export default function Main($$renderer) {
	function test($$renderer) {
		$$renderer.push(`<a><text>Hello</text></a>`);
	}

	$$renderer.push(`<svg><a><text>Hello</text></a></svg><svg>`);
	test($$renderer);
	$$renderer.push(`<!----></svg>`);

	Svg($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<a><text>Hello</text></a>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}