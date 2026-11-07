import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import QR from '@svelte-put/qr/img/QR.svelte';

export default function Img_component($$anchor) {
	QR($$anchor, {
		data: 'https://svelte-put.vnphanquang.com/docs/qr',
		moduleFill: 'violet',
		anchorOuterFill: 'red',
		anchorInnerFill: 'violet',
		width: '500',
		height: '500'
	});
}