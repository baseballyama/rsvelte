import * as $ from 'svelte/internal/server';

const TWO_PI = Math.PI * 2;

export default function DotField($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			dotRadius = 1.5,
			dotSpacing = 14,
			cursorRadius = 500,
			cursorForce = 0.1,
			bulgeOnly = true,
			bulgeStrength = 67,
			glowRadius = 160,
			sparkle = false,
			waveAmplitude = 0,
			gradientFrom = 'rgba(255, 62, 0, 0.35)',
			gradientTo = 'rgba(255, 176, 137, 0.25)',
			glowColor = '#14110E',
			class: className = ''
		} = $$props;

		let root;
		let canvas;
		let glowEl;
		const glowId = `dot-field-glow-${Math.random().toString(36).slice(2, 9)}`;
		let dots = [];
		const mouse = { x: -9999, y: -9999, prevX: -9999, prevY: -9999, speed: 0 };
		let size = { w: 0, h: 0, offsetX: 0, offsetY: 0 };
		let glowOpacity = 0;
		let engagement = 0;
		let rebuild = null;

		$$renderer.push(`<div${$.attr_class(`relative h-full w-full ${$.stringify(className)}`)}><canvas class="absolute inset-0 h-full w-full"></canvas> <svg class="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true"><defs><radialGradient${$.attr('id', glowId)}><stop offset="0%"${$.attr('stop-color', glowColor)}></stop><stop offset="100%" stop-color="transparent"></stop></radialGradient></defs><circle cx="-9999" cy="-9999"${$.attr('r', glowRadius)}${$.attr('fill', `url(#${glowId})`)}${$.attr_style('', { opacity: '0', 'will-change': 'opacity' })}></circle></svg></div>`);
	});
}