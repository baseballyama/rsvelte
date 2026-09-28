import * as $ from 'svelte/internal/server';
import { Canvas } from '@threlte/core';
import { ARButton } from '$lib/index.js';
import Scene from './scene.svelte';

export default function _page($$renderer) {
	$$renderer.push(`<main class="svelte-1ymd26p">`);

	Canvas($$renderer, {
		children: ($$renderer) => {
			Scene($$renderer, {});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	ARButton($$renderer, {
		sessionInit: {
			domOverlay: typeof document !== 'undefined' ? { root: document.body } : undefined,
			optionalFeatures: [
				'dom-overlay',
				'light-estimation',
				'dom-overlay-for-handheld-ar'
			]
		}
	});

	$$renderer.push(`<!----></main>`);
}