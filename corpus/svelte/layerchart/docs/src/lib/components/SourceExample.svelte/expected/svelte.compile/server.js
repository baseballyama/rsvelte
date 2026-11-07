import * as $ from 'svelte/internal/server';

export default function SourceExample($$renderer, $$props) {
	let { name, children } = $$props;

	children?.($$renderer);
	$$renderer.push(`<!---->`);
}