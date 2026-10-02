import * as $ from 'svelte/internal/server';

export default function Noise($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			patternSize = 250,
			patternScaleX = 1,
			patternScaleY = 1,
			patternRefreshInterval = 2,
			patternAlpha = 15
		} = $$props;

		let canvas = void 0;

		$$renderer.push(`<canvas class="pointer-events-none absolute top-0 left-0 h-screen w-screen"${$.attr_style('', { 'image-rendering': 'pixelated' })}></canvas>`);
		// Touch all props so the effect re-runs when they change (matches React deps).
	});
}