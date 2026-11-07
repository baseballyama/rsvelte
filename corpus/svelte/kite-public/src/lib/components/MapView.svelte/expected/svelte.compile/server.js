import * as $ from 'svelte/internal/server';

export default function MapView($$renderer, $$props) {
	// Props
	let { visible } = $$props;

	// Generate timestamp for iframe URL to prevent caching
	const timestamp = Date.now();

	if (visible) {
		$$renderer.push(`<!--[0--><div class="py-4"><iframe${$.attr('src', `/kite_map.html?timestamp=${timestamp}`)} class="h-[calc(100vh-200px)] w-full border-none" title="World news map" loading="lazy"></iframe></div>`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]-->`);
}