import * as $ from 'svelte/internal/server';
import { cubicOut } from 'svelte/easing';
import { Chart, Layer } from 'layerchart';
import TransformControls from '$lib/components/controls/TransformContextControls.svelte';

export let tags = ['tiger'];

export default function Pan_zoom_svg_image($$renderer) {
	Chart($$renderer, {
		transform: {
			mode: 'canvas',
			motion: { type: 'tween', duration: 800, easing: cubicOut },
			scrollMode: 'scale'
		},
		clip: true,
		height: 500,
		children: ($$renderer) => {
			TransformControls($$renderer, {});
			$$renderer.push(`<!----> `);

			Layer($$renderer, {
				type: 'svg',
				children: ($$renderer) => {
					$$renderer.push(`<image href="https://upload.wikimedia.org/wikipedia/commons/f/fd/Ghostscript_Tiger.svg" width="100%" height="100%"></image>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}