import * as $ from 'svelte/internal/server';
import QR from '@svelte-put/qr/svg/QR.svelte';

export default function Svg_component_with_snippet($$renderer) {
	{
		function svg($$renderer, { attributes, innerHTML }) {
			$$renderer.push(`<svg${$.attributes({ ...attributes, class: '**:fill-blue-500' }, void 0, void 0, void 0, 3)}>${$.html(innerHTML)}</svg>`);
		}

		QR($$renderer, {
			data: 'https://svelte.dev',
			logo: 'https://raw.githubusercontent.com/sveltejs/branding/master/svelte-logo.svg',
			logoRatio: 107 / 128,
			shape: 'square',
			margin: 4,
			svg,
			$$slots: { svg: true }
		});
	}
}