import * as $ from 'svelte/internal/server';
import { cubicOut } from 'svelte/easing';
import { Chart, Layer } from 'layerchart';
import TransformControls from '$lib/components/controls/TransformContextControls.svelte';

export let tags = ['tiger'];

export default function Scroll_activation_key($$renderer) {
	$$renderer.push(`<p class="text-sm text-surface-content/50 mb-2">Hold <kbd class="px-1 py-0.5 rounded bg-surface-200 text-xs font-mono">⌘ Command</kbd> to zoom with
	scroll</p> `);

	Chart($$renderer, {
		transform: {
			mode: 'canvas',
			motion: { type: 'tween', duration: 800, easing: cubicOut },
			scrollMode: 'scale',
			scrollActivationKey: 'meta'
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

	$$renderer.push(`<!---->`);
}