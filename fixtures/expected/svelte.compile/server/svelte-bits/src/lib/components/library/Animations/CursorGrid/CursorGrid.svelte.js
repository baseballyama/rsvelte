import * as $ from 'svelte/internal/server';

export default function CursorGrid($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			cellSize = 70,
			color = '#D946EF',
			radius = 140,
			falloff = 'smooth',
			holdTime = 400,
			fadeDuration = 800,
			lineWidth = 1.2,
			maxOpacity = 1,
			fillOpacity = 0,
			gridOpacity = 0,
			cellRadius = 0,
			clickPulse = true,
			pulseSpeed = 600,
			class: className = ''
		} = $$props;

		let container;
		let canvas;

		const FALLOFF_CURVES = {
			linear: (t) => t,
			smooth: (t) => t * t * (3 - 2 * t),
			sharp: (t) => t * t * t
		};

		function hexToRgb(hex) {
			const h = hex.replace('#', '');
			const v = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
			const num = parseInt(v.slice(0, 6), 16);

			return [num >> 16 & 255, num >> 8 & 255, num & 255];
		}

		let wake = () => {};

		$$renderer.push(`<div${$.attr_class(`relative h-full w-full overflow-hidden ${$.stringify(className)}`)}><canvas class="block h-full w-full"></canvas></div>`);
	});
}