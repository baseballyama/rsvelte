import * as $ from 'svelte/internal/server';
import * as THREE from 'three';

export default function PixelTrail($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			gridSize = 40,
			trailSize = 0.1,
			maxAge = 250,
			interpolate = 5,
			easingFunction = (x) => x,
			gooeyFilter,
			color = '#ffffff',
			class: className = ''
		} = $$props;

		let host;

		if (// Trail canvas (used as texture source)
		// Compute the texture-space (coverUv) coordinate that matches the shader sampling.
		// Pointer trail recording
		// 0..1 left-to-right
		// 0..1 bottom-to-top (matches gl_FragCoord)
		// fade trail (full clear each frame, repaint surviving points)
		// canvas y is top-down
		// Reactive uniform sync
		// (no-op reactive dependency demonstration; the effect above re-runs on prop change via $effect
		// implicitly on reactive uniforms used inside its body)
		gooeyFilter) {
			$$renderer.push(`<!--[0--><svg class="z-[1] absolute overflow-hidden"><defs><filter${$.attr('id', gooeyFilter.id)}><feGaussianBlur in="SourceGraphic"${$.attr('stdDeviation', gooeyFilter.strength)} result="blur"></feGaussianBlur><feColorMatrix in="blur" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9" result="goo"></feColorMatrix><feComposite in="SourceGraphic" in2="goo" operator="atop"></feComposite></filter></defs></svg>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <div${$.attr_class(`absolute inset-0 z-[1] ${$.stringify(className)}`)}${$.attr_style(gooeyFilter ? `filter:url(#${gooeyFilter.id});` : '')}></div>`);
	});
}