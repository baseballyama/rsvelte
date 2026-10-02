import * as $ from 'svelte/internal/server';
import DocsLayout from '$lib/components/docs/DocsLayout.svelte';

export default function _layout($$renderer, $$props) {
	let { children } = $$props;

	DocsLayout($$renderer, {
		children: ($$renderer) => {
			children($$renderer);
			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}