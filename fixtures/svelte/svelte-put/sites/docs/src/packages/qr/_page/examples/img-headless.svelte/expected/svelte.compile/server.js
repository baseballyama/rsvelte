import * as $ from 'svelte/internal/server';
import { createQrPngDataUrl } from '@svelte-put/qr';
import { onMount } from 'svelte';

export default function Img_headless($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const config = {
			data: 'https://svelte.dev',
			width: 500,
			height: 500,
			backgroundFill: '#fff'
		};

		let src = '';

		onMount(async () => {
			src = await createQrPngDataUrl(config);
		});

		$$renderer.push(`<div class="flex flex-col items-center gap-2"><img${$.attr('src', src)} width="180" height="180" alt="a qr code"/> <a class="c-btn"${$.attr('href', src)} download="qr.png">Download QR as PNG</a></div>`);
	});
}