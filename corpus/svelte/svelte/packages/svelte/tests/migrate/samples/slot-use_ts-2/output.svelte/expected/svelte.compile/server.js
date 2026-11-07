import * as $ from 'svelte/internal/server';

export default function Output($$renderer, $$props) {
	let { children } = $$props;

	// script tag but no lang="ts", because for example only imports present
	children?.($$renderer);

	$$renderer.push(`<!---->`);
}