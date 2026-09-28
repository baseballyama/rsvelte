import * as $ from 'svelte/internal/server';
import QR from '@svelte-put/qr/img/QR.svelte';

export default function Img_background_fill($$renderer) {
	QR($$renderer, {
		data: 'https://svelte-put.vnphanquang.com/docs/qr',
		anchorOuterFill: 'blue',
		moduleFill: 'green',
		anchorInnerFill: 'blue',
		backgroundFill: 'lightblue',
		width: '168',
		height: '168'
	});
}