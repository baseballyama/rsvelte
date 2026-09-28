import * as $ from 'svelte/internal/server';
import { createQrSvgString, createQrSvgDataUrl } from '@svelte-put/qr';

export default function Svg_headless($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const config = { data: 'https://svelte.dev' };
		const dataURL = createQrSvgDataUrl(config);
		const svgString = createQrSvgString(config);

		$$renderer.push(`<div class="flex flex-col items-center gap-2">${$.html(svgString)} <a class="c-btn"${$.attr('href', dataURL)} download="qr.svg">Download QR as SVG</a></div>`);
	});
}