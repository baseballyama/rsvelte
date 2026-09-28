import * as $ from 'svelte/internal/server';
import { cubicOut } from 'svelte/easing';
import { Chart, Layer } from 'layerchart';
import TransformContextControls from '$lib/components/controls/TransformContextControls.svelte';

export let tags = ['tiger'];

export default function Pan_zoom_html_image($$renderer) {
	Chart($$renderer, {
		transform: {
			mode: 'canvas',
			motion: { type: 'tween', duration: 800, easing: cubicOut },
			scrollMode: 'scale'
		},
		clip: true,
		height: 500,
		children: ($$renderer) => {
			TransformContextControls($$renderer, {});
			$$renderer.push(`<!----> `);

			Layer($$renderer, {
				type: 'html',
				children: ($$renderer) => {
					$$renderer.push(`<div class="h-full flex justify-center"><img src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/fd/Ghostscript_Tiger.svg/500px-Ghostscript_Tiger.svg.png" alt="Ghostscript Tiger" class="h-full"/></div>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}