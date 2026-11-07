import * as $ from 'svelte/internal/server';

export default function Pre($$renderer, $$props) {
	let { children } = $$props;

	$$renderer.push(`<pre>`);
	children($$renderer);
	$$renderer.push(`<!----></pre>`);
}