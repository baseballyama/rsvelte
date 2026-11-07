import * as $ from 'svelte/internal/server';
import QR from '@svelte-put/qr/img/QR.svelte';

export default function Img_component_with_snippet($$renderer) {
	{
		function img($$renderer, { src }) {
			$$renderer.push(`<img${$.attr('src', src)} alt="qr"/>`);
		}

		QR($$renderer, {
			data: 'https://svelte.dev',
			logo: 'https://raw.githubusercontent.com/sveltejs/branding/master/svelte-logo.svg',
			logoRatio: 107 / 128,
			shape: 'square',
			anchorInnerFill: 'tomato',
			anchorOuterFill: 'tomato',
			moduleFill: 'tomato',
			margin: 4,
			width: '500',
			height: '500',
			img,
			$$slots: { img: true }
		});
	}
}