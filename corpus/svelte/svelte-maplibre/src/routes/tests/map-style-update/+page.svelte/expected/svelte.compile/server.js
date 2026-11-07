import * as $ from 'svelte/internal/server';
import MapLibre from '$lib/MapLibre.svelte';
import CodeSample from '$site/CodeSample.svelte';
import code from './+page.svelte?raw';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let styles = [
			'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
			'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json'
		];

		function swapStyle() {
			styles = [...styles].reverse();
		}

		$$renderer.push(`<button class="bg-primary text-primary-foreground hover:bg-primary/90 mb-4 inline-flex h-9 items-center justify-center rounded-md px-4 py-2 text-sm font-medium shadow-xs transition-colors" type="button">Swap Style</button> `);

		MapLibre($$renderer, {
			style: styles[0],
			class: 'relative aspect-[9/16] max-h-[70vh] w-full sm:aspect-video sm:max-h-full',
			standardControls: true
		});

		$$renderer.push(`<!----> `);
		CodeSample($$renderer, { code, startBoundary: 'let styles', endBoundary: '/>' });
		$$renderer.push(`<!---->`);
	});
}