import * as $ from 'svelte/internal/server';
import QR from '@svelte-put/qr/img/QR.svelte';

export default function Img_component($$renderer) {
	QR($$renderer, {
		data: 'https://svelte-put.vnphanquang.com/docs/qr',
		moduleFill: 'violet',
		anchorOuterFill: 'red',
		anchorInnerFill: 'violet',
		width: '500',
		height: '500'
	});
}