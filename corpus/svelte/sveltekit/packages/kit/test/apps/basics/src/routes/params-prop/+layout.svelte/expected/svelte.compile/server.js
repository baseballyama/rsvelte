import * as $ from 'svelte/internal/server';

export default function _layout($$renderer, $$props) {
	let { children } = $$props;

	$$renderer.push(`<a href="/params-prop/123">123</a> <a href="/params-prop/456">456</a> `);
	children($$renderer);
	$$renderer.push(`<!---->`);
}