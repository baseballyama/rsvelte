import * as $ from 'svelte/internal/server';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

export default function GhostCursor($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			class: className = '',
			style = '',
			trailLength = 50,
			inertia = 0.5,
			grainIntensity = 0.05,
			bloomStrength = 0.1,
			bloomRadius = 1.0,
			bloomThreshold = 0.025,
			brightness = 1,
			color = '#B497CF',
			mixBlendMode = 'screen',
			edgeIntensity = 0,
			maxDevicePixelRatio = 0.5,
			targetPixels,
			fadeDelayMs,
			fadeDurationMs,
			zIndex = 10
		} = $$props;

		let host;

		$$renderer.push(`<div${$.attr_class(`pointer-events-none absolute inset-0 ${$.stringify(className)}`)}${$.attr_style(`z-index:${$.stringify(zIndex)};${$.stringify(style)}`)}></div>`);
	});
}