import * as $ from 'svelte/internal/server';

export default function Layout($$renderer, $$props) {
	const { children } = $$props;

	children($$renderer);
	$$renderer.push(`<!---->`);
}