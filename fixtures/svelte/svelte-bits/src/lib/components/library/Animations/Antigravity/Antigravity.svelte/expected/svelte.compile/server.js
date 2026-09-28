import * as $ from 'svelte/internal/server';
import * as THREE from 'three';

export default function Antigravity($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			count = 300,
			magnetRadius = 10,
			ringRadius = 10,
			waveSpeed = 0.4,
			waveAmplitude = 1,
			particleSize = 2,
			lerpSpeed = 0.1,
			color = '#FF9FFC',
			autoAnimate = false,
			particleVariance = 1,
			rotationSpeed = 0,
			depthFactor = 1,
			pulseSpeed = 3,
			particleShape = 'capsule',
			fieldStrength = 10,
			class: className = ''
		} = $$props;

		let host;

		$$renderer.push(`<div${$.attr_class(`w-full h-full ${$.stringify(className)}`)}></div>`);
	});
}