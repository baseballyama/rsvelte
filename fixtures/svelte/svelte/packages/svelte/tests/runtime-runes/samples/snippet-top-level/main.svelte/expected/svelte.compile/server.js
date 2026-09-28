import * as $ from 'svelte/internal/server';

function snippet($$renderer) {
	$$renderer.push(`<p>hello world</p>`);
}

export default function Main($$renderer, $$props) {
	const { children = snippet } = $$props;

	children($$renderer);
	$$renderer.push(`<!---->`);
}